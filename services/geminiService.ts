import { GoogleGenAI, Chat } from "@google/genai";
import { BOOKING_URL, ALEX_BOOKING_URL, MARCO_BOOKING_URL, WHATSAPP_DIRECT_URL, PDF_DOWNLOAD_URL } from '../constants';

// Interface for the response object
export interface GeminiResponse {
  text: string;
  isFallback: boolean;
}

let chatSession: Chat | null = null;
// NEW: State to track conversation flow in Fallback Mode
let fallbackFlowState: 'IDLE' | 'WAITING_NAME' | 'WAITING_CONTACT' = 'IDLE';
let fallbackFlowType: 'NONE' | 'DISCOUNT' | 'GIFT' = 'NONE';
let fallbackUserName: string = '';

// Helpers for strict name and email validation
const isValidName = (input: string): boolean => {
  const trimmed = input.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;

  // Standard name characters (letters, spaces, accents, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s'\-\.]+$/;
  if (!nameRegex.test(trimmed)) return false;

  const lower = trimmed.toLowerCase();

  // Known gibberish / test words / non-name inputs
  const knownGibberish = [
    'asdf', 'asdfg', 'asdfgh', 'asdfghj', 'asdfghjkl',
    'qwerty', 'zxcv', 'zxcvb', 'test', 'prueba', 'xyz', 'abc',
    'aaa', 'bbb', 'ccc', 'hola', 'ninguno', 'no', 'si', 'nada', 'ninguna',
    'a', 'b', 'c', '123'
  ];
  if (knownGibberish.includes(lower)) return false;

  // Reject 3+ identical consecutive characters (e.g. "aaaaa", "zzzzz")
  if (/(.)\1{2,}/.test(lower)) return false;

  // Reject strings longer than 3 chars with no vowels
  if (trimmed.length > 3 && !/[aeiouyáéíóú]/i.test(trimmed)) return false;

  return true;
};

const isValidEmail = (input: string): boolean => {
  const trimmed = input.trim();
  // Standard email regex: username@domain.extension
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;

  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const domainParts = parts[1].split('.');
  if (domainParts.length < 2) return false;

  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) return false;

  return true;
};

// Helper para simular pensamiento en modo fallback (2 segundos)
const simulateThinking = async (ms: number = 2000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const SYSTEM_INSTRUCTION = `
Eres "Barber-IA", el alma digital de "Barbería Elite".
PERSONALIDAD: Carismático, experto y con un toque de humor elegante. Eres ese barbero que sabe lo que necesitas antes de que lo pidas.

OBJETIVO PRINCIPAL:
Tu misión es conversar, dar consejos de estilo rápidos, capturar datos de clientes y cerrar la cita.

REGLAS DE ORO:
1. VARIACIÓN: No repitas frases. Sé dinámico.
2. BREVEDAD: Respuestas de máximo 30-40 palabras.
3. NAVEGACIÓN: Detecta la intención y agrega el comando al final SOLO si el usuario pide ir a otra sección.
4. GALERÍA: Si el usuario pregunta por un estilo específico de una foto, NO navegues a productos ni a la tienda. Mantente en la galería. Solo da info del corte y botón de reserva.

REGLA DE VALIDACIÓN ESTRICTA DE DATOS (CRÍTICO):
- NOMBRE: Cuando solicites el nombre para un descuento o regalo, DEBES verificar que sea un nombre normal (p. ej. "Carlos", "María López"). NUNCA aceptes letras al azar (como "asdf", "qwerty", "xyz", "123", "a") o palabras sin sentido. Si el nombre no es válido, pide amablemente su nombre real sin otorgar el paso siguiente.
- CORREO ELECTRÓNICO: Cuando solicites el correo, DEBES verificar que tenga formato real de email (con '@' y dominio como usuario@gmail.com). NUNCA aceptes texto simple como "asdf", "mi correo", "ninguno" o un nombre simple. Si el correo no es válido, insiste amablemente en pedir un correo electrónico real en formato usuario@dominio.com.

REGLA DE CIERRE DE VENTAS (SERVICIOS):
- Siempre que describas un servicio (Corte, Barba, etc.) o un estilo de la galería, **DEBES** terminar la frase invitando a reservar usando este formato exacto: [📅 Agendar Cita](${BOOKING_URL})

CONTACTO HUMANO / WHATSAPP:
- Si el usuario pide explícitamente hablar con una persona, humano, o soporte directo, O si menciona WhatsApp:
- Responde amablemente y dales el enlace directo: "Entendido. Para atención personalizada humana, contáctanos directo aquí: [💬 Abrir WhatsApp](${WHATSAPP_DIRECT_URL})"

PROTOCOLO DE DESCUENTO (CAPTURA DE LEADS):
Si el usuario dice "Quiero desbloquear el descuento", "cupón", "descuento secreto" o "BARBER2025", sigue estos pasos ESTRICTAMENTE en orden:
1.  **Paso 1 (Solicitar Nombre):** "¡Excelente decisión! Tengo listo tu 20% OFF de bienvenida. Para activarlo en el sistema, necesito registrarlo a tu nombre. ¿Cómo te llamas?"
2.  **Paso 2 (Validar Nombre y Solicitar Correo):**
    - Si el nombre dado NO es un nombre normal (es letras al azar como 'asdf', números o signos), responde: "Por favor dime tu nombre real (sin letras al azar ni números) para registrar tu cupón."
    - Si el nombre ES válido, responde: "Un gusto [Nombre]. Para validar el cupón, necesito tu correo electrónico en formato usuario@dominio.com."
3.  **Paso 3 (Validar Correo y Entregar Código):**
    - Si el correo NO tiene formato válido de email, responde: "Por favor ingresa un correo electrónico válido con formato usuario@dominio.com para activar tu descuento."
    - Si el correo ES válido, responde: "¡Registro exitoso! Tu código secreto es **BARBER2025**. Al terminar tu corte, muéstralo en recepción. ¡Te esperamos!"
REGLA CRÍTICA PARA DESCUENTO: En este protocolo NO debes dar ningún enlace al PDF. Da únicamente el código promocional BARBER2025.

PROTOCOLO DE REGALO SORPRESA (PDF GUIDE):
Si el usuario dice "quiero mi regalo sorpresa" o "qué es el regalo del menú", sigue estos pasos:
1. **Paso 1 (Saludo y Nombre):** "¡Sorpresa! 🎁 Solo por estar aquí en nuestro sitio, te regalo nuestra guía exclusiva: 'Tendencias de Corte 2025'. ¿Cuál es tu nombre para personalizarlo?"
2. **Paso 2 (Validar Nombre y Solicitar Correo):**
    - Si el nombre dado NO es un nombre normal, responde: "Por favor dime un nombre válido para personalizar tu regalo."
    - Si el nombre ES válido, responde: "¡Un gusto [Nombre]! ¿Cuál es tu correo electrónico en formato usuario@dominio.com?"
3. **Paso 3 (Validar Correo y Entregar Link):**
    - Si el correo NO es un email válido, responde: "Por favor ingresa un correo electrónico real (por ejemplo usuario@gmail.com) para entregarte tu regalo."
    - Si el correo ES válido, responde: "¡Listo! Aquí tienes tu regalo directo: [📥 Descargar Guía PDF Tendencias](${PDF_DOWNLOAD_URL}). ¡Que lo disfrutes!"
REGLA CRÍTICA PARA REGALO SORPRESA: En este protocolo entrega el enlace PDF y NO des el código BARBER2025.

INFORMACIÓN TÉCNICA DE SERVICIOS (Úsala cuando pregunten detalles):
- Corte Executive ($350): Asesoría facial, lavado relajante, corte de precisión y styling.
- Ritual de Barba ($250): Toalla caliente, aceites esenciales, afeitado a navaja.
- The Gentleman ($550): Corte + Ritual de Barba + Masaje + Bebida.
- Camuflaje de Canas ($400): Gel matizador.

INFORMACIÓN DE PRODUCTOS (Venta Exclusiva en Sucursal - NO SUGERIR EN CONTEXTO DE GALERÍA):
- **Cera Mate Elite ($280):** Fijación fuerte, acabado natural sin brillo.
- **Aceite Barba Real ($250):** Hidratación profunda, aroma madera/sándalo. 
- **Shampoo Mentol ($220):** Estimula el cuero cabelludo.
- *NOTA:* Los productos se venden en mostrador.

INFORMACIÓN DE ESTILOS VISUALES (Galería - Conócelos todos):
- **Degradado Medio (Mid Fade):** Equilibrio perfecto entre piel y cabello. Limpio y profesional.
- **Tupé Clásico (Pompadour):** Volumen y altura. Requiere secado y cera. Para hombres con presencia.
- **Crop Texturizado:** Flequillo corto recto, mucha textura arriba. Urbano y fácil de peinar.
- **Mullet Moderno:** Corto enfrente y lados, largo atrás con caída. Atrevido y con mucha personalidad.
- **Rapado Geométrico:** Corte minimalista casi a ras, con líneas de diseño artístico. Mantenimiento bajo.
- **Rizos con Taper Fade:** Mantiene la textura natural de los rizos arriba, pero limpia patillas y nuca.
- **Barba Vikinga:** Larga, densa e imponente. Requiere aceites y perfilado constante.

MAPA DE INTENCIÓN -> NAVEGACIÓN:
- CORTES, CORTE, SERVICIOS, PRECIOS, MENU -> [[NAVIGATE:services]]
- ESTILO, ESTILOS, FOTOS, GALERIA, CATALOGO, LOOKS -> [[NAVIGATE:gallery]]
- PRODUCTOS, CERA, GEL, SHAMPOO, COMPRAR, TIENDA -> [[NAVIGATE:products]]
- BARBEROS, EQUIPO, QUIÉN CORTA -> [[NAVIGATE:team]]
- UBICACIÓN, MAPA, DÓNDE, PARKING -> [[NAVIGATE:location]]
- RESEÑAS, OPINIONES -> [[NAVIGATE:reviews]]
- PROMOS, PROMOCIONES, DESCUENTOS -> [[NAVIGATE:promos]]
- CITAS, HORARIOS, CONTACTO -> [[NAVIGATE:contact]]
- REDES, INSTAGRAM -> [[NAVIGATE:social]]

ENLACES INTELIGENTES:
- Usa SIEMPRE formato Markdown para botones: [Texto Botón](URL).
- Cita General: ${BOOKING_URL}
`;

// Helper to clean AI response
const cleanResponseText = (text: string): string => {
  if (!text) return "";
  let cleaned = text;
  cleaned = cleaned.replace(/^(THOUGHT|PLAN|REASONING|ANALYSIS):[\s\S]*?(\n\n|\n|$)/i, '');
  cleaned = cleaned.replace(/^\d+\.\s+\*\*?(Analyze|Identify)[\s\S]*?(?=(¡|¿|Hola|El))/i, '');
  cleaned = cleaned.replace(/^(Respuesta|Answer|BarberBot|Barber-IA):/i, '');
  return cleaned.trim();
};

// --- DYNAMIC FALLBACK SYSTEM ---
const FALLBACK_GREETINGS = [
    "¡Qué tal, jefe! Bienvenido a Barbería Elite. ¿En qué te ayudo a mejorar hoy?",
    "¡Hola! Estás en territorio de buen estilo. ¿Buscas corte, barba o solo mirar?",
    "¡Buenas! Aquí Barber-IA reportándose. ¿Listo para el próximo nivel de imagen?"
];

const FALLBACK_SERVICES_AND_TRENDS = [
    "Lo que rompe la calle ahora es el **Crop Texturizado**. Moderno y limpio. Mira nuestros estilos. [[NAVIGATE:gallery]]",
    "El **Mullet Moderno** volvió con fuerza, pero un **Tupé Clásico** nunca muere. Checa el menú. [[NAVIGATE:services]]",
    "Hacemos desde degradados a navaja hasta arreglos de barba premium. Aquí tienes la lista de precios. [[NAVIGATE:services]]",
    "Para barba, recomendamos nuestro 'Ritual' con toalla caliente. Es otro nivel. [[NAVIGATE:services]]",
    "Tenemos una variedad completa. Si quieres ver ejemplos visuales, ve a la galería. [[NAVIGATE:gallery]]"
];

const FALLBACK_PRICES = [
    "Calidad pura: Corte Executive por $350 y Barba por $250. ¿Te animas? [[NAVIGATE:services]]",
    "Inversión de $350 por el corte Executive. Incluye lavado y styling. Sales nuevo. [[NAVIGATE:services]]",
    "Nuestros precios arrancan en $250 (Barba) y $350 (Corte). Vale cada peso. [[NAVIGATE:services]]"
];

const FALLBACK_LOCATION = [
    "Céntrico y fácil: Calle Principal 555. Busca el poste de barbero. [[NAVIGATE:location]]",
    "Estamos en Calle Principal 555. Tenemos estacionamiento cerca. [[NAVIGATE:location]]",
    "Ubicados en el corazón de la ciudad: Calle Principal 555. ¡Caimos cuando quieras! [[NAVIGATE:location]]"
];

const FALLBACK_DEFAULT = [
    `Disculpa, no capté eso. Pero si buscas el mejor corte de la ciudad, estás en el lugar correcto. ¿Agendamos? [📅 Ver Disponibilidad](${BOOKING_URL})`,
    `Mi IA está enfocada en estilismo y citas. ¿Te ayudo a reservar o quieres ver nuestros servicios? [[NAVIGATE:services]]`,
    `No estoy seguro de entender, pero puedo mostrarte nuestros estilos o agendar tu visita ahora mismo. [📅 Agendar](${BOOKING_URL})`
];

// Helper para obtener respuesta aleatoria
const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const getFallbackResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();

  // --- 0. MANEJO DE ESTADO DE CONVERSACIÓN (FLOW MANAGEMENT) ---
  // Esto permite que el bot recuerde que pidió el Nombre y luego pida el Email
  if (fallbackFlowState !== 'IDLE') {
      // 0.1 Check de Interrupción: Si el usuario cambia de tema bruscamente
      if (lowerInput.match(/\b(cancelar|precio|donde|ubicacion|agendar|cita|servicios|menu|salir)\b/)) {
          fallbackFlowState = 'IDLE';
          fallbackFlowType = 'NONE';
          fallbackUserName = '';
          // Dejamos que el código siga para responder la nueva duda
      } 
      // 0.2 Flujo: Esperando Nombre -> Validar Nombre -> Pide Email
      else if (fallbackFlowState === 'WAITING_NAME') {
          if (!isValidName(input)) {
              return "Para registrar tu beneficio necesito un nombre válido (evita letras al azar como 'asdf' o números). ¿Cuál es tu nombre real?";
          }
          fallbackUserName = input.trim();
          fallbackFlowState = 'WAITING_CONTACT';
          return `¡Un gusto, ${fallbackUserName}! 👋 Para terminar de validar tu registro en el sistema, ingresa tu correo electrónico (ejemplo: usuario@correo.com).`;
      } 
      // 0.3 Flujo: Esperando Contacto -> Validar Email -> Entrega Premio según tipo
      else if (fallbackFlowState === 'WAITING_CONTACT') {
          if (!isValidEmail(input)) {
              return "Por favor ingresa un correo electrónico válido con formato real (por ejemplo: usuario@gmail.com o tu_nombre@correo.com).";
          }
          const currentFlowType = fallbackFlowType;
          const savedName = fallbackUserName || 'ti';
          fallbackFlowState = 'IDLE';
          fallbackFlowType = 'NONE';
          fallbackUserName = '';

          if (currentFlowType === 'GIFT') {
              return `¡Listo, **${savedName}**! Registro completado. \n\n📚 **Tu Regalo Directo:** [📥 Descargar Guía PDF Tendencias](${PDF_DOWNLOAD_URL})\n\n¡Que lo disfrutes!`;
          } else {
              return `¡Listo, **${savedName}**! Registro completado. \n\n🎟️ **Tu Código Secreto:** **BARBER2025** (20% OFF)\n\n¡Muéstralo en recepción al terminar tu servicio para hacer válido tu descuento!`;
          }
      }
  }

  // --- 1. DETECCIÓN DE INTENCIONES (TRIGGERS) ---

  // 1.1 CREATIVIDAD / POEMAS (Manejo elegante del Offline Mode)
  if (lowerInput.match(/\b(poema|verso|chiste|historia|cuento|cantar|rap|escribe)\b/)) {
      return "¡Qué talento! 🎭 Mi módulo de creatividad nivel Shakespeare requiere conexión total a la nube (API Key). En este **Modo Básico**, soy experto en agendar tu cita y mostrarte estilos. ¿Vemos la galería? [[NAVIGATE:gallery]]";
  }

  // 1.2 REGALO / SORPRESA (Trigger del Header) -> ACTIVA FLUJO REGALO
  if (lowerInput.includes('regalo') || lowerInput.includes('sorpresa')) {
      fallbackFlowState = 'WAITING_NAME'; // Start Flow
      fallbackFlowType = 'GIFT';
      return "¡Sorpresa! 🎁 Solo por estar aquí, te regalo nuestra guía: 'Tendencias de Corte 2025'. ¿Cómo te llamas?";
  }
  
  // 1.3 DESBLOQUEAR DESCUENTO (Trigger del Botón PROMOS) -> ACTIVA FLUJO DESCUENTO
  // Colocado AQUÍ (arriba) para que tenga prioridad sobre el regex genérico de "promos".
  if (lowerInput.includes('desbloquear') || (lowerInput.includes('quiero') && lowerInput.includes('descuento'))) {
      fallbackFlowState = 'WAITING_NAME'; // Start Flow
      fallbackFlowType = 'DISCOUNT';
      return "¡Excelente decisión! 🥂 Para activar tu 20% OFF de bienvenida en el sistema, primero dime: ¿Cuál es tu nombre?";
  }

  // 1.4 PRODUCTOS ESPECÍFICOS
  if (lowerInput.includes('aceite barba real') || (lowerInput.includes('aceite') && lowerInput.includes('producto'))) {
      return "El **Aceite Barba Real ($250)** es oro líquido. Hidrata la piel debajo de la barba, elimina la picazón y deja un aroma a madera increíble. Imprescindible. ¡Pídelo en mostrador!";
  }
  
  if (lowerInput.includes('cera') || lowerInput.includes('mate')) {
      return "La **Cera Mate Elite ($280)** es nuestro best-seller. Fijación fuerte pero flexible, sin ese brillo grasoso. Perfecta para Crops y texturizados. ¡Pídela en mostrador!";
  }
  
  if (lowerInput.includes('shampoo') || lowerInput.includes('mentol')) {
      return "El **Shampoo Mentol ($220)** es un despertar para tu cabeza. Limpieza profunda que estimula el riego sanguíneo. La sensación de frescura es adictiva.";
  }

  if (lowerInput.match(/\b(producto|comprar|venden|tienda|pelo|peinar)\b/)) {
      return "Para mantener tu look como el primer día, tenemos los mejores productos. Mira nuestra selección exclusiva. [[NAVIGATE:products]]";
  }

  // 1.5 DETECCION DE CONTACTO HUMANO / WHATSAPP
  if (lowerInput.match(/\b(humano|persona real|whatsapp|whats|celular|telefono|llamar|hablar con alguien|contacto directo)\b/)) {
      return `Si prefieres hablar con uno de nosotros directamente, escríbenos: [💬 Chat en WhatsApp](${WHATSAPP_DIRECT_URL})`;
  }

  // 1.6 DETECCION DE BOTONES DE "DETALLE"
  if (lowerInput.includes('ritual de barba') || lowerInput.includes('ritual')) {
      return `El **Ritual de Barba** es terapia. Toalla caliente, aceites esenciales y navaja libre. Tu cara te lo agradecerá. [📅 Agendar](${BOOKING_URL})`;
  }
  if (lowerInput.includes('corte executive')) {
      return `El **Corte Executive** es ingeniería pura: Asesoría de rostro + Lavado relajante + Corte + Peinado. Sales listo para triunfar. [📅 Agendar](${BOOKING_URL})`;
  }
  if (lowerInput.includes('the gentleman')) {
      return `**The Gentleman** es el combo rey: Corte + Barba + Masaje + Bebida. 45 minutos de desconexión total. [📅 Agendar](${BOOKING_URL})`;
  }
  if (lowerInput.includes('camuflaje')) {
      return `El **Camuflaje** reduce las canas sutilmente en 5 minutos. No parece tinte, solo pareces 5 años más joven. [📅 Agendar](${BOOKING_URL})`;
  }

  // 1.7 ESTILOS VISUALES ESPECÍFICOS
  if (lowerInput.includes('vikinga')) {
      return `La **Barba Vikinga** impone respeto. Requiere un buen perfilado para mantener la forma correcta. [📅 Reservar](${BOOKING_URL})`;
  }
  if (lowerInput.includes('tupe') || lowerInput.includes('pompadour')) {
      return `El **Tupé Clásico** es para hombres con presencia. Mucho volumen y altura para destacar. [📅 Reservar](${BOOKING_URL})`;
  }
  if (lowerInput.includes('crop') || lowerInput.includes('texturizado')) {
      return `El **Crop Texturizado** es tendencia urbana. Flequillo corto y mucha textura arriba. [📅 Reservar](${BOOKING_URL})`;
  }

  // --- DETECCION DE RESTO DE ESTILOS VISUALES ---
  if (lowerInput.includes('degradado') || lowerInput.includes('fade')) {
      return `El **Degradado Medio (Mid Fade)** es pura clase. Transición suave que conecta perfecto. Muy limpio y profesional. [📅 Reservar este Estilo](${BOOKING_URL})`;
  }
  if (lowerInput.includes('rapado') || lowerInput.includes('buzz') || lowerInput.includes('geometrico')) {
      return `El **Rapado Geométrico** es minimalismo y actitud. Muy corto, con líneas de diseño. 0% mantenimiento, 100% estilo. [📅 Reservar este Estilo](${BOOKING_URL})`;
  }
  if (lowerInput.includes('atras') || lowerInput.includes('slick')) {
      return `El **Slick Back** es elegancia pura. Todo hacia atrás, brillante y ordenado. Un clásico que no falla. [📅 Reservar este Estilo](${BOOKING_URL})`;
  }
  if (lowerInput.includes('rizos') || lowerInput.includes('curly') || lowerInput.includes('taper')) {
      return `Para **Rizos**, el Taper Fade es ideal. Mantiene tu textura arriba pero limpia el contorno para verte arreglado. [📅 Reservar este Estilo](${BOOKING_URL})`;
  }
  if (lowerInput.includes('mullet')) {
      return `El **Mullet Moderno** es para los atrevidos. Negocio enfrente y fiesta atrás. ¿Te atreves? [📅 Reservar este Estilo](${BOOKING_URL})`;
  }

  // --- OTRAS INTENCIONES GENERALES ---
  
  if (lowerInput.match(/\b(estacionamiento|parking|coche|carro|auto)\b/)) {
      return "¡Sí! Tenemos convenio con el estacionamiento de la esquina. Tu primera hora va por nuestra cuenta al realizarte un servicio. [[NAVIGATE:location]]";
  }
  
  if (lowerInput.includes('alex'))
    return `Alex "The Razor" tiene la agenda cotizada. Mira sus espacios aquí: [✂️ Reservar con Alex](${ALEX_BOOKING_URL}) [[NAVIGATE:team]]`;

  if (lowerInput.includes('marco'))
    return `Para un corte de caballero clásico, Marco es el indicado. [✂️ Reservar con Marco](${MARCO_BOOKING_URL}) [[NAVIGATE:team]]`;

  if (lowerInput.includes('jay'))
    return `Jay es el maestro del color y el diseño. Agenda aquí: [📅 Agendar con Jay](${BOOKING_URL}) [[NAVIGATE:team]]`;

  if (lowerInput.includes('barbero') || lowerInput.includes('equipo'))
    return "Alex, Marco y Jay. El tridente del estilo. ¿Tienes algún favorito? [[NAVIGATE:team]]";

  if (
    lowerInput.match(/\b(tarjetas?|efectivo|transferencia|visa|mastercard|amex)\b/) || 
    lowerInput.match(/\b(formas?|metodos?|medios?|opciones?)\s+de\s+pagos?\b/) ||
    lowerInput.includes('aceptan') ||
    (lowerInput.includes('como') && lowerInput.includes('pagar'))
  ) {
      return "Sin complicaciones: aceptamos **Efectivo, Transferencia y Tarjetas** (Crédito/Débito). Tú eliges. [[NAVIGATE:services]]";
  }

  if (lowerInput.match(/\b(horarios?|horas?|abren?|cierran?|dias?|abierto|cerrado|tardes?|mañanas?)\b/) || lowerInput.includes('a que hora')) {
      return "Nuestro horario es: **Lun-Vie 10:00-20:00** y **Sábados 09:00-18:00**. Los domingos descansamos. [[NAVIGATE:contact]]";
  }

  if (lowerInput.match(/\b(cita|reserva|agendar|disponible|turno|lugar)\b/))
    return `¡Claro! Asegura tu silla antes de que se llenen. [📅 Agendar Ahora](${BOOKING_URL}) [[NAVIGATE:contact]]`;

  // REGEX GENERAL DE PROMOS (Ahora está abajo de la lógica específica de desbloqueo)
  if (lowerInput.match(/\b(promos?|promocion(es)?|descuentos?|codigos?|ofertas?|primera|cupon(es)?|regalos?)\b/))
    return "¡Regalo de la casa! Ve a nuestro chat para desbloquear tu 20% OFF de bienvenida o tu regalo sorpresa del menú. [[NAVIGATE:promos]]";

  if (lowerInput.match(/\b(instagram|facebook|tiktok|redes|fotos|insta|video|social|face)\b/))
    return "¡Conéctate con nosotros! Subimos historias diarias y cortes exclusivos. ¡Síguenos! [[NAVIGATE:social]]";
  
  if (lowerInput.match(/\b(opinion|reseña|clientes|que dicen|estrellas)\b/))
    return "Casi 5 estrellas perfectas. La gente entra normal y sale siendo otra persona. [[NAVIGATE:reviews]]";

  if (lowerInput.match(/\b(fotos?|galeria|imagenes?|catalogo|estilos?|looks?|visual(es)?|ver trabajos?)\b/)) {
      return "Una imagen vale más que mil palabras. Mira nuestros cortes estrella aquí. [[NAVIGATE:gallery]]";
  }

  if (lowerInput.match(/\b(popular|moda|tendencias?|moderno|recomiendas?|sugerencias?|cortes?|pelo|cabello|barba|bigote|fades?|degradados?|tijeras?|navajas?|menu)\b/))
    return getRandom(FALLBACK_SERVICES_AND_TRENDS);
  
  if (lowerInput.match(/\b(precio|costo|cuanto|servicios|cuesta|valor|pagar)\b/))
    return getRandom(FALLBACK_PRICES);

  if (lowerInput.match(/\b(donde|dodne|dnd|ubica|llegar|direccion|calle|mapa|zona|lugar)\b/))
    return getRandom(FALLBACK_LOCATION);

  if (lowerInput.match(/\b(hola|buenos|buenas|que tal|hey|hi)\b/)) 
    return getRandom(FALLBACK_GREETINGS);

  return getRandom(FALLBACK_DEFAULT);
};

// Helper function to safely get API key 
const getApiKey = (): string | undefined => {
  try {
    // 1. Try Standard process.env
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'undefined' && process.env.GEMINI_API_KEY.trim() !== '') {
        return process.env.GEMINI_API_KEY.trim();
      }
      if (process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY.trim() !== '') {
        return process.env.API_KEY.trim();
      }
    }

    // 2. Try import.meta.env
    try {
      // @ts-ignore
      const metaEnv = import.meta.env;
      if (metaEnv) {
        const key = metaEnv.VITE_GEMINI_API_KEY || metaEnv.VITE_API_KEY || metaEnv.GEMINI_API_KEY || metaEnv.API_KEY;
        if (key && key !== 'undefined' && key.trim() !== '') {
          return key.trim();
        }
      }
    } catch (e) {
      // ignore
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
};

export const initChat = async (): Promise<void> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("❌ SmartSite Error: API_KEY is missing in environment variables. Operating in Basic Fallback Mode.");
    chatSession = null;
    return;
  }

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

  for (const modelName of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const chat = ai.chats.create({
        model: modelName,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: [
          { role: "user", parts: [{ text: "Hola" }] },
          { role: "model", parts: [{ text: "¡Qué tal! Bienvenido a Barbería Elite. ¿Listo para renovar tu estilo?" }] },
        ],
      });
      chatSession = chat;
      console.log(`✅ SmartSite: Gemini AI Connected Successfully using ${modelName}.`);
      return;
    } catch (error) {
      console.warn(`⚠️ SmartSite: Failed to initialize Gemini with model ${modelName}:`, error);
    }
  }
  
  console.error("❌ SmartSite Error: Could not initialize Gemini with any model alias.");
  chatSession = null;
};

export const sendMessageToGemini = async (message: string): Promise<GeminiResponse> => {
  if (!chatSession) {
    await initChat();
  }

  if (!chatSession) {
     await simulateThinking();
     return { text: getFallbackResponse(message), isFallback: true };
  }

  try {
    const result = await chatSession.sendMessage({ message: message });
    if (result && result.text) {
      return { text: cleanResponseText(result.text), isFallback: false };
    }
    throw new Error("Empty response from Gemini model");
  } catch (error: any) {
    console.warn("⚠️ API Error during message, attempting session refresh:", error);
    chatSession = null;
    await initChat();
    
    if (chatSession) {
      try {
        const retryResult = await chatSession.sendMessage({ message: message });
        if (retryResult && retryResult.text) {
          return { text: cleanResponseText(retryResult.text), isFallback: false };
        }
      } catch (retryErr) {
        console.warn("⚠️ Retry failed:", retryErr);
      }
    }

    await simulateThinking();
    return { text: getFallbackResponse(message), isFallback: true };
  }
};

// CRITICAL UPDATE FOR STABILITY:
// This function now handles errors "silently". If the background context trigger fails
// (e.g., due to Rate Limits from scrolling too fast), it returns EMPTY text and isFallback: FALSE.
// This prevents the whole app from showing the "Basic Mode" badge just because of a minor scroll error.
export const triggerContextMessage = async (contextPrompt: string): Promise<GeminiResponse> => {
   if (!chatSession) await initChat();
   
   if (!chatSession) {
       // Only if session is truly null (no API key), we use fallback text
       await simulateThinking(1500); 
       return { text: getFallbackContext(contextPrompt), isFallback: true };
   }

   try {
     const result = await chatSession.sendMessage({ 
        message: `[SISTEMA: El usuario está viendo la sección: ${contextPrompt}. Di una frase corta (10 palabras) con mucho carisma invitando a la acción. NO uses comandos NAVIGATE.]` 
     });
     return { text: cleanResponseText(result.text), isFallback: false };
   } catch (error: any) {
     console.warn("⚠️ API Error during context trigger (ignoring to preserve session):", error);
     // DO NOT SWITCH TO FALLBACK MODE. Just return empty.
     // This keeps the chat "Online" for the user to type manually.
     return { text: "", isFallback: false };
   }
}

const getFallbackContext = (section: string): string => {
    switch(section) {
        case 'services': return getRandom([
            "Calidad de primera. ¿Te tienta el Corte Executive?",
            "Mira nuestro menú. Todo es nivel premium."
        ]);
        case 'gallery': return getRandom([
            "Inspiración pura. Toca cualquier estilo para verlo en detalle.",
            "¿Ves algo que te guste? Podemos replicarlo."
        ]);
        case 'products': return getRandom([ 
            "El secreto de un buen peinado es el producto correcto.",
            "Llévate la calidad Elite a tu casa con nuestra línea profesional."
        ]);
        case 'team': return getRandom([
            "Puros maestros de la tijera. ¿Quién te inspira confianza?",
            "Alex, Marco y Jay. No puedes equivocarte."
        ]);
        case 'location': return "Estamos cerca. ¡Pásate y te invitamos una fría!";
        case 'reviews': return "La gente habla maravillas. ¿Te sumas al club?";
        case 'promos': return "¡Ese 20% OFF te está llamando! Desbloquéalo en el chat.";
        case 'contact': return `¡Es el momento! Asegura tu silla ahora. [📅 Reservar](${BOOKING_URL})`;
        case 'social': return "Síguenos para no perderte las tendencias. ¡Sube tu look y etiquétanos!";
        default: return "¿En qué te puedo echar una mano?";
    }
}