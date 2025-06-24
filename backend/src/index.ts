import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Env {
	GEMINI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			const { code, targetLanguage } = await request.json<{ code: string; targetLanguage: string }>();

			if (!code || !targetLanguage) {
				return new Response(JSON.stringify({ error: "Missing 'code' or 'targetLanguage' in request body." }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

			const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

			const prompt = `Translate the following code snippet to ${targetLanguage}.
Do not add any explanation, commentary, or markdown formatting like \`\`\` around the code.
**IMPORTANT: Preserve all original comments and their exact placement in the translated code. do not add extra spaces in between.**
Only provide the raw, translated code itself.

Original Code:
${code}`;

			const result = await model.generateContent(prompt);
			const geminiResponse = result.response;
			const translatedCode = geminiResponse.text();

			return new Response(JSON.stringify({ translation: translatedCode }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('Error during translation:', error);
			return new Response(JSON.stringify({ error: 'An error occurred while translating the code.' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};
