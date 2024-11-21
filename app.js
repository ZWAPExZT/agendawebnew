const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up passport
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Set up session
app.use(session({
    secret: 'hemmelig',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Database connection
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/discord');
}
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Velkommen til Agenda</title>
                <link rel="stylesheet" href="styles.css"> <!-- Link to your CSS file -->
            </head>
            <body>
                <div class="container">
                            <img src="/agendaing4.png" class="logo">
                    <h1>Velkommen til Agenda Roleplay!</h1>
                    <p>Klik på knappen nedenfor for at tilslutte dig vores Discord server og blive en del af fællesskabet.</p>
<a href="${process.env.DISCORD_INVITE_LINK}" target="_blank">
    <button class="button">Få Discord Invitation</button>
</a>
                    <button class="button" onclick="window.location.href='/apply'">Ansøg om Whitelist</button>
                </div>
            </body>
        </html>
    `);
});


// Step 1: Basic Info Form
app.get('/apply', ensureAuthenticated, (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Whitelist Ansøgning</title>
                <link rel="stylesheet" href="styles2.css">
            </head>
            <body>
                <div class="container">
                    <h2>IRL Oplysninger</h2>
                    <form method="POST" action="/apply">
                        <div class="form-container">
                            <label for="discordName">Discord Navn:</label>
                            <input type="text" name="discordName" placeholder="Discord Navn" required>

                            <label for="discordId">Discord ID:</label>
                            <input type="text" name="discordId" placeholder="Discord ID" required>

                            <label for="age">Alder:</label>
                            <input type="text" name="age" placeholder="Alder" required>

                            <label for="steamLink">Steam Profil:</label>
                            <input type="text" name="steamLink" placeholder="Steam Link" required>

                            <button type="submit" class="button">Næste</button>
                        </div>
                    </form>
                </div>
            </body>
        </html>
    `);
});

// Step 2: RP Experience Form
app.post('/apply', ensureAuthenticated, (req, res) => {
    const { discordName, discordId, age, steamLink } = req.body;
    req.session.application = { discordName, discordId, age, steamLink };
    res.send(`
        <html>
            <head>
                <title>RP Erfaring</title>
                <link rel="stylesheet" href="styles3.css">
            </head>
            <body>
                <div class="container">
                    <h2>Erfaring</h2>
                    <form method="POST" action="/apply/experience">
                        <label for="rpExperience">Hvad betyder RP for dig?</label><br>
                        <textarea name="rpExperience" placeholder="RP erfaring" required></textarea><br><br>
                        
                        <label for="rpBackground">Har du tidligere erfaring med RP? Hvis ja, hvorfra?</label><br>
                        <textarea name="rpBackground" placeholder="RP baggrund" required></textarea><br><br>
                        
                        <button type="submit" class="button">Næste</button>
                    </form>
                </div>
            </body>
        </html>
    `);
});
// Step 3: RP Scenarios Form
app.post('/apply/experience', ensureAuthenticated, (req, res) => {
    const { rpExperience, rpBackground } = req.body;
    req.session.application = { ...req.session.application, rpExperience, rpBackground };
    res.send(`
<html>
    <head>
        <title>RP Scenarier</title>
        <style>
            /* General body styling */
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    background-image: url("gtabg1.png");
    margin: 0;
    padding: 0;
}

/* Container for the entire page content */
.container { 
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.5); /* 20% transparent white */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}


/* Heading for the page */
h2 {
    text-align: center;
    color: #333;
    font-size: 24px;
    margin-bottom: 30px;
}

/* Style for the form container */
form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* Label styles for each form field */
label {
    font-size: 16px;
    color: #555;
    font-weight: bold;
}

/* Textarea styles */
textarea {
    padding: 10px;
    font-size: 16px;
    border: 2px solid #ccc;
    border-radius: 5px;
    outline: none;
    transition: border-color 0.3s;
    width: 100%;
    height: 150px;
}

/* Focus state for textareas */
textarea:focus {
    border-color: #6c63ff;
}

/* Button styling */
.button {
    background-color: #4CAF50; /* Green */
    color: white;
    font-size: 16px;
    font-weight: bold;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
}

/* Button hover effect */
.button:hover {
    background-color: #45a049;
    transform: scale(1.05);
}

/* Button active state */
.button:active {
    transform: scale(0.95);
}

/* Center the form fields and the button */
button[type="submit"] {
    align-self: center;
}

/* Responsive Design: For smaller screens, adjust padding */
@media screen and (max-width: 768px) {
    .container {
        padding: 15px;
    }

    input[type="text"], textarea, .button {
        font-size: 14px;
    }
}

        </style>
    </head>
    <body>
        <div class="container">
            <h2>Scenarier</h2>
            <form method="POST" action="/apply/scenarios">
                <label for="charBackground">Karakterbaggrund:</label><br>
                <textarea name="charBackground" placeholder="Karakter baggrund" required></textarea><br><br>

                <label for="crimeScenario">Opdig et RP-scenarie med kriminelt RP:</label><br>
                <textarea name="crimeScenario" placeholder="Kriminalt scenarie" required></textarea><br><br>

                <label for="legalScenario">Opdig et RP-scenarie baseret på lovligt RP:</label><br>
                <textarea name="legalScenario" placeholder="Lovligt scenarie" required></textarea><br><br>

                <button type="submit" class="button">Indsend Ansøgning</button>
            </form>
        </div>
    </body>
</html>


    `);
});

// Final Step: Submit Form Data to Database
app.post('/apply/scenarios', ensureAuthenticated, (req, res) => {
    const { charBackground, crimeScenario, legalScenario } = req.body;
    const applicationData = { 
        ...req.session.application, 
        charBackground, 
        crimeScenario, 
        legalScenario, 
        status: 'pending' 
    };

    // Save to in-memory data store
    applications.push(applicationData);

    res.send('Din ansøgning er blevet indsendt!');
    sendApplicationMessage(applicationData.discordId, applicationData);
});


const sendApplicationMessage = async (discordId, applicationData) => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

    await client.login(process.env.DISCORD_BOT_TOKEN);

    client.once('ready', async () => {
        console.log('Botten er logget ind og klar!');

        const channel = await client.channels.fetch('1300933300290060298'); // Replace with actual channel ID
        const notificationChannel = await client.channels.fetch('1300933287119945820'); // Notification channel ID

        if (!channel || !notificationChannel) {
            console.error('Kan ikke finde kanal(er)');
            return;
        }

        // Create accept and reject buttons
        const acceptButton = new ButtonBuilder()
            .setCustomId('accept_' + discordId)
            .setLabel('GODKEND')
            .setStyle(ButtonStyle.Success);

        const rejectButton = new ButtonBuilder()
            .setCustomId('reject_' + discordId)
            .setLabel('AFVIS')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(acceptButton, rejectButton);

        try {
            // Send embed message with application data
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Ny Ansøgning!')
                .setDescription(`**Ansøger:** <@${discordId}>\n\n**Grundlæggende Oplysninger:**\nDiscord Navn: ${applicationData.discordName}\nDiscord ID: ${applicationData.discordId}\nAlder: ${applicationData.age}\nSteam Link: ${applicationData.steamLink}\n\n**RP Erfaring:**\n${applicationData.rpExperience}\n\n**RP Baggrund:**\n${applicationData.rpBackground}\n\n**Karakter Baggrund:**\n${applicationData.charBackground}\n\n**Kriminalt RP Scenarie:**\n${applicationData.crimeScenario}\n\n**Lovligt RP Scenarie:**\n${applicationData.legalScenario}`)
                .setTimestamp()
                .setFooter({ text: 'Agenda Roleplay' });

            await channel.send({
                embeds: [embed],
                components: [row],
            });


            console.log('Ansøgningsmeddelelse sendt');
        } catch (err) {
            console.error('Fejl ved afsendelse af meddelelse: ', err);
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
    
        const [action, applicantId] = interaction.customId.split('_');
    
        const member = await interaction.guild.members.fetch(applicantId);
        const notificationChannel = await client.channels.fetch('1300933287119945820'); // Ensure notificationChannel is defined here
    
        if (action === 'accept') {
            try {
                const role = interaction.guild.roles.cache.get('1300933004482580552'); // Replace with your actual role ID
                if (role) {
                    // Add the role to the member
                    await member.roles.add(role);
    
                    // Send the response to the interaction
                    await interaction.reply({
                        content: `Du har accepteret <@${applicantId}>. Rollen er blevet tildelt.`,
                        ephemeral: true,
                    });
    
                    // Send a DM to the member
                    await member.send(`Din ansøgning er blevet accepteret af <@${interaction.user.id}>. Du har nu modtaget rollen whitelisted.`);
    
                    // Send a notification in the notification channel
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('Ansøgning Accepteret!')
                        .setDescription(`**Ansøger:** <@${applicantId}>\n\nAnsøgningen er blevet accepteret af <@${interaction.user.id}>`)
                        .setTimestamp()
                        .setFooter({ text: 'Agenda Roleplay' });
    
                    await notificationChannel.send({
                        embeds: [embed],
                    });
    
                } else {
                    await interaction.reply({
                        content: 'Rolle ikke fundet.',
                        ephemeral: true,
                    });
                }
            } catch (err) {
                console.error('Fejl ved accept af ansøger: ', err);
                await interaction.reply({
                    content: 'Der opstod en fejl ved accept af ansøgningen.',
                    ephemeral: true,
                });
            }
        } else if (action === 'reject') {
            try {
                await interaction.reply({
                    content: `Du har afvist <@${applicantId}>'s ansøgning.`,
                    ephemeral: true,
                });
    
                const applicant = await client.users.fetch(applicantId);
                await applicant.send(`Din ansøgning er blevet afvist af <@${interaction.user.id}>.`);
    
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Ansøgning Afvist!')
                    .setDescription(`**Ansøger:** <@${applicantId}>\n\nAnsøgningen er blevet afvist af <@${interaction.user.id}>.`)
                    .setTimestamp()
                    .setFooter({ text: 'Agenda Roleplay' });
    
                await notificationChannel.send({
                    embeds: [embed],
                });
            } catch (err) {
                console.error('Fejl ved afvisning af ansøger: ', err);
                await interaction.reply({
                    content: 'Der opstod en fejl ved afvisning af ansøgningen.',
                    ephemeral: true,
                });
            }
        }
    });
    


    client.on('error', (error) => {
        console.error('Discord klient fejl: ', error);
    });
};


app.get('/auth/discord', (req, res, next) => {
    passport.authenticate('discord')(req, res, next);
});

app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to home or dashboard
        res.redirect('/');
    }
);


// Start the server
app.listen(3000, () => {
    console.log('Server kører på http://localhost:3000');
});
