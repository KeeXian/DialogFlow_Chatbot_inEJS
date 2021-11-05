const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const ejs = require('ejs');
const app = express();
const dFService = require('./dialogflow');

app.use(express.urlencoded({extended: true,}));

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));

// Set Template Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Constants
let botname = 'Alex the Chatbot';
let username = 'User';
const chatLogs = [{
    user: botname,
    message: 'Hello, I am a chatbot, how can I help you?',
}];

// Get request
app.get('/', (req, res) => {
    res.render('index', {'chatlogs': chatLogs});
});

// Post request
app.post('/', async (req, res) => {
    const { userMessage } = req.body;
    chatLogs.push({
        user: username,
        message: userMessage,
    });
    try {
        let result = eval(userMessage);
        if (typeof result === 'number') {
            console.log("The answer is", result.toFixed(2));
            response = `The answer is ${result.toFixed(2)}`;
        } else {
            throw new Error("The answer is not an integer");
        }
    } catch (error) {
        result = await dFService.executeQueries(123456, [userMessage]);
        if (result.action === 'calculate'){
            let parameters = result.parameters.fields;

            number1 = parameters.number.numberValue;
            number2 = parameters.number1.numberValue;
            operator = parameters.operators.stringValue;
            
            response = ("The answer is " + eval(number1 + operator + number2));
        } else{
            response = result.fulfillmentText;
        }
    }
    chatLogs.push({
        user: botname,
        message: response,
    });
    res.render('index', {'chatlogs': chatLogs})   
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});