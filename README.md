# Aedar multi-purpose Discord Bot

This bot is designed to enhance the Patins No Porto discord server, and other fancy stuff

## Features

- Slash commands
- And some other random things
- `/features`: a menu where server admins turn any part of the bot on or off (every command category, plus automatic features like welcome messages, AI chat and translations)

## Getting Started

### Prerequisites

- Node.js 24 or newer, and npm
- Discord Bot token

### Installation

1. Clone this repository to your local machine:

```bash
git clone https://github.com/Drkpulse/Aedar_discordjsBot.git
```

2. Navigate to the project directory:

```bash
cd Aedar_discordjsBot
```

3. Install dependencies:

```bash
npm install
```

4. Set up your environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Discord Bot token.

### Usage

The bot runs on [CommandKit](https://commandkit.dev) 1.x, which builds and starts it for you.

Development (restarts and reloads commands when you save a file):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

`/botupdate` (dev only) pulls the latest code, reinstalls and rebuilds, then exits so the new build starts.
That restart only happens when the bot runs under a process manager such as pm2 (`pm2 start npm --name aedar -- start`)
or a systemd service with `Restart=always`. Otherwise it updates and asks you to restart the bot by hand.

### Configuration

Still managing the configuration file

### Adding Commands

1. Create a new file in `src/app/commands/(category)/`, for example `src/app/commands/(fun)/hello.js`.
2. Export `command` (the slash command data) and `chatInput` (the function that runs it).
3. Optionally export `options` (`cooldown`, `isActive`, `isAdmin`, `devOnly`) and `metadata` (`userPermissions`, `botPermissions`, `guilds`).

```js
import { SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
	.setName('hello')
	.setDescription('Says hello')
	.toJSON();

export const chatInput = async ({ interaction }) => {
	await interaction.reply('Hello!');
};

export const options = {
	cooldown: '10s',
};
```

Events go in `src/app/events/<eventName>/`, and the checks that run before every command (cooldowns, disabled commands, dev-only commands) are in `src/app/commands/+global-middleware.js`.

New event-driven features should get an entry in `AUTOMATIC_FEATURES` in `src/helpers/featureManager.js` and start with `if (!isAutomaticFeatureEnabled('<name>', guildId)) return;`, so they show up in `/features`. A new `(category)` folder shows up there on its own.

### Contributing

Contributions are welcome! Please fork this repository and create a pull request with your changes.

### License

This project is licensed under the [MIT License](LICENSE).

---


