module.exports = ({ interaction, commandObj, handler}) => {
	if (commandObj.options?.cooldown) {

		interaction.reply({content: 'You have cooldown', ephemeral: true });
		console.log(commandObj);
		return true;
	}
}
