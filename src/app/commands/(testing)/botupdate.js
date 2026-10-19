import { execFile } from 'child_process';
import path from 'path';
import { DEV_GUILD_IDS } from '../../../helpers/devConfig.js';

// Pulls the latest code and rebuilds (src/upbot.sh), then restarts the bot.
// The restart works by exiting and letting the process manager start the new build,
// so it only happens when the bot runs under pm2 or systemd.

const UPDATE_TIMEOUT_MS = 10 * 60 * 1000;

export const command = {
	name: 'botupdate',
	description: 'Atualiza o bot a partir do Git, compila e reinicia',
};

const isManaged = () => Boolean(process.env.pm_id || process.env.INVOCATION_ID);

// Keeps the end of the script output, so it fits in a Discord message.
const tail = (text, max = 1500) => (text.length > max ? `…${text.slice(-max)}` : text).trim();

export const chatInput = async ({ interaction }) => {
	await interaction.deferReply();

	const scriptPath = path.join(process.cwd(), 'src', 'upbot.sh');

	execFile('bash', [scriptPath], { timeout: UPDATE_TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 }, async (error, stdout, stderr) => {
		const output = tail(`${stdout}\n${stderr}`);

		if (error) {
			console.error('Bot update failed:', error.message, stderr);
			await interaction.editReply(`❌ A atualização falhou:\n\`\`\`\n${output || error.message}\n\`\`\``).catch(() => {});
			return;
		}

		console.log(`Bot update output:\n${stdout}`);

		if (!isManaged()) {
			await interaction.editReply(
				`✅ Código atualizado e compilado.\n⚠️ O bot não está a correr com pm2 ou systemd, por isso não reinicio sozinho. Reinicie-o manualmente para usar a nova versão.\n\`\`\`\n${output}\n\`\`\``
			).catch(() => {});
			return;
		}

		await interaction.editReply(`✅ Código atualizado e compilado. A reiniciar o bot...\n\`\`\`\n${output}\n\`\`\``).catch(() => {});
		// Give Discord a moment to deliver the reply, then exit so pm2/systemd starts the new build.
		setTimeout(() => process.exit(0), 2000);
	});
};

export const options = {
	devOnly: true,
};

export const metadata = {
	guilds: DEV_GUILD_IDS,
};
