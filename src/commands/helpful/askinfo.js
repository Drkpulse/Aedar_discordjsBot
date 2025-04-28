const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldowns = require('../../validations/cooldowns');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Informações sobre os Patins no Porto')
        .addStringOption(option =>
            option
                .setName('pergunta')
                .setDescription('O que queres saber sobre os Patins no Porto?')
                .setRequired(false)
        ),

    run: async ({interaction, client, handler}) => {
        await interaction.deferReply();

        const pergunta = interaction.options.getString('pergunta')?.toLowerCase();

        // Base information embed
        const baseEmbed = new EmbedBuilder()
            .setColor('#38B3E3')
            .setTitle('Patins no Porto')
            .setDescription('Somos um grupo de pessoas que se juntam para patinar na cidade do Porto.')
            .setTimestamp()
            .setFooter({ text: 'Patins no Porto', iconURL: client.user.displayAvatarURL() });

        // If no specific question, provide general info
        if (!pergunta) {
            baseEmbed
                .addFields(
                    { name: '📱 Redes Sociais', value: '[Instagram](https://www.instagram.com/patinsnoporto/)' },
                    { name: '❓ Perguntas Comuns', value: 'Usa `/info pergunta:` seguido de:\n- próximos eventos\n- onde comprar\n- aprender a patinar\n- tempo\n- requisitos\n- horários' }
                );

            await interaction.editReply({ embeds: [baseEmbed] });
            return;
        }

        // Handle different types of questions
        if (pergunta.includes('evento') || pergunta.includes('próxim')) {
            // Check for scheduled events in the guild
            const events = await interaction.guild.scheduledEvents.fetch();

            if (events.size === 0) {
                baseEmbed.addFields({ name: '🗓️ Próximos Eventos', value: 'Não há eventos agendados no momento. Fica atento ao canal de anúncios!' });
            } else {
                const eventList = events.map(event => {
                    const startTime = new Date(event.scheduledStartTime).toLocaleString('pt-PT');
                    return `**${event.name}** - ${startTime}\n${event.description ? event.description.substring(0, 100) + '...' : 'Sem descrição'}\n`;
                }).join('\n');

                baseEmbed.addFields({ name: '🗓️ Próximos Eventos', value: eventList });
            }

            // Check if there are any events with roles and mention them
            const guild = interaction.guild;
            const roles = await guild.roles.fetch();
            const eventRoles = roles.filter(role =>
                events.some(event => role.name.includes(event.name))
            );

            if (eventRoles.size > 0) {
                const rolesList = eventRoles.map(role => `<@&${role.id}>`).join(', ');
                baseEmbed.addFields({ name: '🏷️ Roles de Eventos', value: `Temos as seguintes roles para eventos: ${rolesList}` });
            }
        }
        else if (pergunta.includes('comprar') || pergunta.includes('loja') || pergunta.includes('material')) {
            baseEmbed.addFields(
                { name: '🛍️ Onde Comprar Material', value: 'Recomendamos as seguintes lojas:\n\n- **Skate Shop** - Rua da Boavista, Porto\n- **Inline Center** - Av. da República, Gaia\n- **DecaPro** - Centro Comercial Brasília\n\nOnline:\n- [Decathlon](https://www.decathlon.pt)\n- [Roces Official](https://www.roces.com)\n- [Powerslide](https://www.powerslide.com)' }
            );
        }
        else if (pergunta.includes('aprender') || pergunta.includes('aul') || pergunta.includes('inici')) {
            baseEmbed.addFields(
                { name: '🎓 Aprender a Patinar', value: 'Temos encontros para todos os níveis, incluindo iniciantes!\n\nRecomendações para quem está a começar:\n- Usa sempre proteções (capacete, joelheiras, cotoveleiras e protetores de pulso)\n- Vem com água e roupa confortável\n- Não tenhas medo de cair, faz parte do processo\n\nPodes também consultar o nosso canal de tutoriais no Discord para vídeos de iniciação.' }
            );
        }
        else if (pergunta.includes('tempo') || pergunta.includes('meteorolog') || pergunta.includes('chuva')) {
            // First reply with basic info
            baseEmbed
                .setDescription('A previsão do tempo é essencial para os nossos encontros ao ar livre. Geralmente cancelamos em caso de chuva ou piso molhado.')
                .addFields({ name: '🌤️ Tempo', value: 'A verificar o tempo para o Porto...' });

            await interaction.editReply({ embeds: [baseEmbed] });

            // Then actually fetch the weather data
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Porto&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric&lang=pt`);
                const weatherData = response.data;

                // Get weather icon
                const weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

                // Create new embed with weather information
                const weatherEmbed = new EmbedBuilder()
                    .setColor('#38B3E3')
                    .setTitle('Tempo no Porto')
                    .setDescription(`**${weatherData.weather[0].description}**`)
                    .setThumbnail(weatherIcon)
                    .addFields(
                        { name: '🌡️ Temperatura', value: `${Math.round(weatherData.main.temp)}°C`, inline: true },
                        { name: '💧 Humidade', value: `${weatherData.main.humidity}%`, inline: true },
                        { name: '💨 Vento', value: `${Math.round(weatherData.wind.speed * 3.6)} km/h`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Patins no Porto', iconURL: client.user.displayAvatarURL() });

                await interaction.followUp({ embeds: [weatherEmbed] });
                return; // Return early as we've already sent the followup embed
            } catch (error) {
                console.error('Error fetching weather data:', error);
                // If error, update the original embed to show an error message
                baseEmbed.setFields([{
                    name: '🌤️ Tempo',
                    value: 'Não foi possível obter a previsão do tempo. Usa o comando `/weather local:Porto` para tentar novamente.'
                }]);
            }
        }
        else if (pergunta.includes('requisito') || pergunta.includes('precis') || pergunta.includes('necessári')) {
            baseEmbed.addFields(
                { name: '📋 Requisitos', value: 'Para participar nos nossos encontros só precisas de:\n\n- Patins (inline ou quads)\n- Proteções recomendadas (capacete, joelheiras, cotoveleiras e protetores de pulso)\n- Boa disposição!\n\nNão importa o teu nível, temos pessoas de todos os níveis e ajudamo-nos mutuamente.' }
            );
        }
        else if (pergunta.includes('horário') || pergunta.includes('quando') || pergunta.includes('hora')) {
            baseEmbed.addFields(
                { name: '🕒 Horários Regulares', value: 'Normalmente encontramo-nos:\n\n- **Terças** - 21:00 - Parque da Cidade (Encontro técnico)\n- **Quintas** - 21:00 - Alameda das Fontainhas (Night Skating)\n- **Domingos** - 16:00 - Rotativo (consulta o canal de anúncios)\n\nEstes horários podem variar. Consulta sempre os eventos agendados no Discord para confirmação.' }
            );

            // Add a field showing upcoming events if there are any
            const events = await interaction.guild.scheduledEvents.fetch();
            if (events.size > 0) {
                const nextEvent = events.sort((a, b) => a.scheduledStartTimestamp - b.scheduledStartTimestamp).first();
                const startTime = new Date(nextEvent.scheduledStartTime).toLocaleString('pt-PT');

                baseEmbed.addFields({
                    name: '🗓️ Próximo Evento',
                    value: `**${nextEvent.name}** - ${startTime}`
                });
            }
        }
        else if (pergunta.includes('loja') || pergunta.includes('compra')) {
            // Directly execute a search for stores and include interactive store information
            baseEmbed
                .setTitle('Lojas de Patins')
                .setDescription('Aqui estão algumas lojas onde podes comprar patins e equipamento:')
                .addFields(
                    {
                        name: '🏬 Lojas Físicas no Porto',
                        value: '**Skate Shop** - Rua da Boavista, Porto - [Mapa](https://maps.google.com/?q=Skate+Shop+Porto)\n**DecaPro** - Centro Comercial Brasília - [Mapa](https://maps.google.com/?q=Centro+Comercial+Brasilia+Porto)'
                    },
                    {
                        name: '🏬 Lojas Físicas em Gaia',
                        value: '**Inline Center** - Av. da República, Gaia - [Mapa](https://maps.google.com/?q=Inline+Center+Gaia)'
                    },
                    {
                        name: '🌐 Lojas Online',
                        value: '[Decathlon](https://www.decathlon.pt/browse/c0-todos-os-desportos/c1-patinagem/c2-patins/_/N-18uh6ea)\n[Roces Official](https://www.roces.com)\n[Powerslide](https://www.powerslide.com)'
                    }
                );
        }
        else {
            // Try to detect specific brand or model queries
            if (pergunta.includes('powerslide') || pergunta.includes('roces') || pergunta.includes('flying eagle')) {
                baseEmbed
                    .setTitle('Informação sobre Marcas')
                    .addFields(
                        {
                            name: '🏷️ Marcas Populares',
                            value: '**Powerslide** - Marca alemã conhecida por patins de velocidade e urban\n**Roces** - Marca italiana com boa relação qualidade/preço\n**Flying Eagle** - Marca chinesa em crescimento com bons preços'
                        },
                        {
                            name: '💰 Faixas de Preço',
                            value: 'Iniciante: 80€-150€\nIntermédio: 150€-300€\nAvançado: 300€+'
                        }
                    );
            } else {
                // General response for unrecognized questions
                baseEmbed
                    .addFields(
                        { name: '❓ Informação Geral', value: 'Os Patins no Porto são um grupo aberto a todas as pessoas que queiram patinar na cidade do Porto, independentemente do nível ou tipo de patins.' },
                        { name: '📱 Redes Sociais', value: '[Instagram](https://www.instagram.com/patinsnoporto/)' },
                        { name: '🤔 Outras Perguntas', value: 'Se não encontraste a resposta que procuras, pergunta diretamente no canal de chat ou usa `/sugestao` para sugerir nova funcionalidade ao bot.' }
                    );
            }
        }

        await interaction.editReply({ embeds: [baseEmbed] });
    },
    options: {
        cooldown: '10s',
    },
};
