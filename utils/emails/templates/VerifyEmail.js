const verifyEmail = (code) => {
    return `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Institute Panel</title>
    </head>
    <body>
        <style>
            *{
                margin: 0px;
                padding: 0px;
                box-sizing: border-box;
            }
            .text-theme{
                color: #fd7e14;
            }
            .text-center{
                text-align: center;
            }
            .mb-5{
                margin-bottom: 50px;
            }
            .bg-theme{
                background-color: rgb(4,44,0);
                color: white;
                padding: 50px;
            }
            button{
                border: none;
                width: 200px;
                height: 40px;
                border-radius: 5px;
                margin: 10px;
            }
        </style>
        <br />
        <h1 class="text-theme text-center mb-5" style="color: #fd7e14; text-align: center; margin-bottom: 50px;"> Welcome to MADRASA Panel </h1>
        <section class="text-center bg-theme" style="color: white; padding: 50px; background-color: rgb(4,44,0); text-align: center;">
            <button style="border: none; width: 200px; height: 40px; border-radius: 5px; margin: 10px;" class="code"> ${code} </button>
        </section>
    </body>
    </html>
    `
}

module.exports = verifyEmail;