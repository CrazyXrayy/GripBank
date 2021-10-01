// Imports
const express = require('express');
const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const { findOne } = require('./models/account.js');
const Account = require('./models/account.js');



const app = express()


const port = 3000


const dbURI = 'mongodb+srv://supreet:supreet@cluster0.0epba.mongodb.net/bank?retryWrites=true&w=majority'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(port, () => console.info(`App listening on port ${port}`)))
  .catch(err => console.log(err));

//console.log(result) ; 
// Static Files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// Specific folder example
app.use('/css', express.static(__dirname + 'views/app.css'))
// app.use('/js', express.static(__dirname + 'public/js'))
// app.use('/img', express.static(__dirname + 'public/images'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navigation
app.get('/', (req, res) => {
  res.render('index', { text: 'Hey' })
})

app.get('/add-account', (req, res) => {
  const account = new Account({
    name: 'Guraav B ',
    accountNo: 69421 + 1,
    balance: 1000 + 250
  })

  account.save()
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get('/createAccount', (req, res) => {
  res.render('createAccount')
})

app.post('/createAccount', (req, res) => {
  // console.log(req.body);
  const account = new Account(req.body);
  console.log(req.body);
  account.save()
    .then(result => {
      res.redirect('/viewCustomer');
    })
    .catch(err => {
      console.log(err);
    });
});
app.get('/transferMoney', (req, res) => {
  res.render('transferMoney')
})

app.post('/transferMoneyPortal', async (req, res) => {
  console.log(req.body);
  const { accountNoFrom, accountNoTo, amount } = req.body;
  const accTo = await Account.findOne({ accountNo: accountNoTo });
  const accFrom = await Account.findOne({ accountNo: accountNoFrom });
  //console.log(accFrom) ;
  if(!accTo)
  {
    console.log("Account doesn't exist ") ;
    res.render('transferError' , {error : "Account you are trying to transfer to doesn't exist ."}) ; 
    return ; 
  }
  if(!accFrom )
  {
    console.log("Account doesn't exist ") ;
    res.render('transferError' , {error : "Account you are trying to transfer from doesn't exist ."}) ; 
    return ; 
  }
  if (parseInt(amount) >= parseInt(accFrom.balance)) {
    console.log("Cannot transfer");
    res.render('transferError' , {error : "Invalid amount entered !"}) ;
    return ; 
  }
  else {
    accFrom.balance = await (parseInt(accFrom.balance) - parseInt(amount));
    await accFrom.save();
    accTo.balance = await (parseInt(accTo.balance) + parseInt(amount));
    await accTo.save();
    console.log(accFrom.balance);
    res.render('transferSuccess', { accountFrom: accFrom.name , accountTo: accTo.name , paisa :amount })
  }

})
app.get('/viewCustomer', (req, res) => {
  Account.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('viewCustomer', { accounts: result });
    })
    .catch(err => {
      console.log(err);
    });
});
app.get('/transferMoney', (req, res) => {
  res.render('transferMoney');
})
//app.listen(port, () => console.info(`App listening on port ${port}`))