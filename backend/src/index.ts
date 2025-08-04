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

		const url = new URL(request.url);
		const path = url.pathname;
		const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
		const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

		try {
			//Function for handling the translation
			const handleTranslate = async () => {
				const { code, targetLanguage } = await request.json<{ code: string; targetLanguage: string }>();

				if (!code || !targetLanguage) {
					return new Response(JSON.stringify({ error: "Missing 'code' or 'targetLanguage' in request body." }), {
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					});
				}

				const prompt = `Translate the following code snippet to ${targetLanguage}.
Do not add any explanation, commentary, or markdown formatting like \`\`\` around the code.
**IMPORTANT: Preserve all original comments and their exact placement in the translated code. Do not add extra spaces in between.**
Only provide the raw, translated code itself.

Original Code:
${code}`;

				const result = await model.generateContent(prompt);
				const translatedCode = result.response.text();

				return new Response(JSON.stringify({ translation: translatedCode }), {
					status: 200,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			};
			//Function for handling the explanation
			const handleExplain = async () => {
				const { code } = await request.json<{ code: string }>();

				if (!code) {
					return new Response(JSON.stringify({ error: "Missing 'code' in request body." }), {
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					});
				}

				const prompt = `Explain the following code snippet in detail:
1. Provide a clear breakdown of what each part (functions, variables, logic blocks) does.
2. If applicable, describe the overall purpose or intent of the code.
3. Offer a step-by-step explanation of how the code executes.
4. If the code is executable, show a sample input and the corresponding output.
5. Keep the explanation beginner-friendly but technically accurate.

Code:
${code}`;

				const result = await model.generateContent(prompt);
				const explanation = result.response.text();

				return new Response(JSON.stringify({ explanation }), {
					status: 200,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			};
			if (path === '/') {
				return handleTranslate();
			}
			if (path === '/v1/translate') {
				return handleTranslate();
			}
			if (path === '/v1/explain') {
				return handleExplain();
			}
			// Fallback for unknown paths
			return new Response(JSON.stringify({ error: 'Route not found.' }), {
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('Error during request:', error);
			return new Response(JSON.stringify({ error: 'An internal error occurred.' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};
