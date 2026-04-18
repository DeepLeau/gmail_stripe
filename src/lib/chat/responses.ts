/**
 * Pool of generic AI responses for the mock API.
 * These are plausible, context-neutral responses suitable for an email assistant.
 * Each response reflects a different conversational strategy.
 */
export const MOCK_RESPONSES: readonly string[] = Object.freeze([
  "Je comprends votre question. Pour vous donner une réponse précise, j'aurais besoin d'accéder à vos emails. Une fois connecté, je pourrai analyser votre boîte et vous fournir les informations pertinentes.",
  "Bonne question ! En me basant sur mes connaissances actuelles, je peux vous dire que vos emails contiennent des informations très variées. N'hésitez pas à me poser des questions plus spécifiques.",
  "Intéressant ! Je suis prêt à vous aider. Précisez votre question et je ferai de mon mieux pour vous trouver une réponse dans vos emails.",
  "Je vais analyser vos messages pour vous répondre au mieux. Pouvez-vous me donner un peu plus de contexte sur ce que vous recherchez exactement ?",
  "Absolument, c'est exactement le type de question où je peux vous aider. Mes capacités d'analyse de vos emails me permettront de vous donner une réponse personnalisée et précise.",
] as const)

/** Number of responses in the pool — used for bounds checking and tests */
export const MOCK_RESPONSES_COUNT = MOCK_RESPONSES.length
