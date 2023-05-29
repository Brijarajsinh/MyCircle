module.exports = {

  //sendMail function sends mail to user for verification process
  sendMail: function (receiver) {
    from = 'mahidabrijrajsinh2910@gmail.com', // sender address
      to = `${receiver}`, // list of receivers
      subject = 'Registration', // Subject line
      text = 'Registration Success',
      html = `<h1>You are registered Successfully in MyCircle web Application<h1><br>
                      <h3>Remember Your Credentials that is something like this:</h3> <br>
                      <h4>E-mail ID:->${receiver}<br>
                      <h1>Thanks For Registration</h1><br>
                      <a href='http://localhost:3000/verify/?email=${receiver}&'>To Verify Your Account Please Click Here</a>
                      <h4> Click Here To Login:=> http://192.168.1.176:3000/login></h4>`

    return {
      //returns from,to,subject,text and html  value to the calling variable or function
      from,
      to,
      subject,
      text,
      html
    }
  },

  //dateCompare function compares date which are passed as a parameter with the current date and time
  dateCompare: function (date) {

    const diff = Math.abs(new Date(date) - new Date());

    //converting the difference in minutes
    const minutes = Math.floor((diff / 1000) / 60);

    //returns difference between two time format in minutes
    return minutes;
  }
}

