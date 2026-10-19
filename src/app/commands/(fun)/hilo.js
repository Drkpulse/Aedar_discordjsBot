import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } from 'discord.js';
import { placeBet, payOut } from '../../../utils/casino.js';

const CARD_NAMES = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const cardName = (value) => CARD_NAMES[value] ?? String(value);
const drawCard = () => Math.floor(Math.random() * 13) + 1;

// Each correct guess multiplies the pot by HOUSE_EDGE / chance of being right,
// so safe guesses pay little and risky ones pay a lot. An equal card is a draw.
const HOUSE_EDGE = 0.95;
const ROUND_TIMEOUT_MS = 60_000;

const chanceHigher = (card) => (13 - card) / 12;
const chanceLower = (card) => (card - 1) / 12;

export const command = new SlashCommandBuilder()
	.setName('hilo')
	.setDescription('Jogue Hi-Lo! Adivinhe se a próxima carta é maior ou menor.')
	.addIntegerOption((option) =>
		option.setName('bet')
			.setDescription('Quantia a ser apostada')
			.setMinValue(1)
			.setRequired(true)
	).toJSON();

export const chatInput = async ({ interaction }) => {
	const bet = interaction.options.getInteger('bet');
	const userId = interaction.user.id;

	await interaction.deferReply();

	let placed;
	try {
		placed = await placeBet(userId, bet);
	} catch (error) {
		console.error('Erro no Hi-Lo:', error);
		return interaction.editReply('Ocorreu um erro ao processar sua aposta. Tente novamente mais tarde.').catch(() => {});
	}
	if (!placed.ok) return interaction.editReply(placed.message);

	let card = drawCard();
	let pot = bet;
	let streak = 0;
	let history = '';

	const buttons = () => new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('hilo_higher')
			.setLabel('Maior')
			.setEmoji('⬆️')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(chanceHigher(card) === 0),
		new ButtonBuilder()
			.setCustomId('hilo_lower')
			.setLabel('Menor')
			.setEmoji('⬇️')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(chanceLower(card) === 0),
		new ButtonBuilder()
			.setCustomId('hilo_cashout')
			.setLabel(`Levantar ${pot} moedas`)
			.setEmoji('💰')
			.setStyle(ButtonStyle.Success)
			.setDisabled(streak === 0),
	);

	const status = () =>
		`${history}🃏 Carta atual: **${cardName(card)}** · Pote: **${pot}** moedas · Acertos: **${streak}**\n` +
		`Maior paga x${multiplier(chanceHigher(card))} · Menor paga x${multiplier(chanceLower(card))}`;

	const message = await interaction.editReply({ content: status(), components: [buttons()] });

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		idle: ROUND_TIMEOUT_MS,
	});

	let finished = false;
	const finish = async (text, winnings, source) => {
		finished = true;
		collector.stop('finished');
		let balance = placed.balance;
		try {
			if (winnings > 0) balance = await payOut(userId, winnings);
		} catch (error) {
			console.error('Erro ao pagar o Hi-Lo:', error);
			text += '\n⚠️ Não foi possível pagar o prémio. Fale com um administrador.';
		}
		const content = `${text}\nSaldo: **${balance}** moedas.`;
		if (source) await source.update({ content, components: [] }).catch(() => {});
		else await interaction.editReply({ content, components: [] }).catch(() => {});
	};

	collector.on('collect', async (button) => {
		if (button.user.id !== userId) {
			return button.reply({ content: 'Este jogo não é seu! Use `/hilo` para jogar.', flags: MessageFlags.Ephemeral });
		}
		if (finished) return;

		if (button.customId === 'hilo_cashout') {
			return finish(`💰 Você levantou **${pot}** moedas depois de **${streak}** acertos!`, pot, button);
		}

		const guessHigher = button.customId === 'hilo_higher';
		const chance = guessHigher ? chanceHigher(card) : chanceLower(card);
		const next = drawCard();
		const line = `${cardName(card)} → ${cardName(next)}`;

		if (next === card) {
			history = `🤝 ${line}: carta igual, ninguém ganha. Continue!\n`;
		} else if ((next > card) === guessHigher) {
			pot = Math.floor(pot * multiplierValue(chance));
			streak++;
			history = `✅ ${line}: acertou!\n`;
		} else {
			return finish(`❌ ${line}: errou! Perdeu a aposta de **${bet}** moedas (pote de ${pot}).`, 0, button);
		}

		card = next;
		await button.update({ content: status(), components: [buttons()] }).catch(() => {});
	});

	collector.on('end', async () => {
		if (finished) return;
		// Timed out: pay out what was won so far (nothing lost if the player never guessed)
		await finish(`⏰ Tempo esgotado! Você ficou com **${pot}** moedas.`, pot);
	});
};

function multiplierValue(chance) {
	return chance > 0 ? HOUSE_EDGE / chance : 0;
}

function multiplier(chance) {
	return chance > 0 ? multiplierValue(chance).toFixed(2) : '—';
}

export const options = {
	cooldown: '5s',
};
