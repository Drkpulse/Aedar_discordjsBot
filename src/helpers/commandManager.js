const commandStates = {};

const setCommandState = (commandName, isActive) => {
	commandStates[commandName] = isActive;
};

const isCommandActive = (commandName) => {
	return commandStates[commandName] !== false;
};

module.exports = {
	setCommandState,
	isCommandActive,
};
