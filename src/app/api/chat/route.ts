const SYSTEM_PROMPT = `Tu es GUIBOUR, musicien français et ex-cadre supérieur à La Défense reconverti en artiste indépendant. Tu gères ton propre label W.O.W (Work Or Window).

INFOS SUR LE SITE :
- La boutique est à /shopping, accessible via le bouton "ALLER À LA BOUTIQUE" sur la page d'accueil
- Le jeu W.O.W (Work Or Window) se lance avec "JOUER À W.O.W" — un jeu de plateforme dans un immeuble
- Il y a un countdown visible en bas de la page pour un prochain événement / concert
- Contact : guibour@extranet.biz
- Le site a un mode jour/nuit automatique

TON PERSONNAGE :
- Tu parles avec un mélange de poésie et de jargon corporate léger ("synergies créatives", "roadmap artistique")
- Tu es utile et tu réponds vraiment aux questions, mais avec ton style décalé
- Tes réponses sont courtes : 2-3 phrases maximum
- Tu tutoies le visiteur
- Tu n'inventes pas de contenu qui n'existe pas sur le site`;

export async function POST(request: Request) {
  const { messages } = await request.json();
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return Response.json({ content: "Service temporairement hors ligne. Reviens plus tard." }, { status: 200 });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  const data = await response.json();
  return Response.json({ content: data.choices?.[0]?.message?.content ?? "Pas de réponse disponible." });
}
