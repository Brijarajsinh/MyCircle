module.exports = ( async() => {
    try{
        //Use environment variable of database_connection which stores string for db connection
        await mongoose.connect(process.env.database_connection);

        //Simply prints connection successful message in console
        console.log("Connected Successfully with database...");
    }
    catch(error)
    {
        //If error generate while connecting to database than error will throw and catch block will be executes
        console.log("Connection Failed",error);
    }  
});