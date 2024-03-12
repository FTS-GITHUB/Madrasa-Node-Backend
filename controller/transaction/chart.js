const express = require('express');
const mongoose = require('mongoose');
//Stripe
const { stripe, } = require("../../utils/Stripe")

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


const teacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    stripeCustomerId: String,
});

const Teacher = mongoose.model('Teacher', teacherSchema);



app.post('/transaction', async (req, res) => {
    try {
        const { teacherId, amount } = req.body;

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });

        }

        //teacher Stripe ID
        const stripeCustomerId = teacher.stripeCustomerId;
        const transactionId = req.params.id


        // Calculate Payment
        const paymentAmount = calculatePayment(amount);


        const paymentIntent = await stripe.paymentIntents.create({
            amount: paymentAmount,
            currency: 'usd',
            customer: stripeCustomerId,
            payment_method: 'pm_card_visa',
            confirm: true,
        });


        res.json({ message: 'Transaction successful', paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//function to calculate payment 
function calculatePayment(amount) {

    return amount * 1.1;
}


