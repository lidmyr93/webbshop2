$(document).ready(function(){
    displayCars();
    displayOrderedcars();
    CheckForm();
});//Ready

let carholder = $('#carholder');
// Function för att hämta hem data från JSON-fil
function displayCars(){
    let url = "cars.json";
    
    //jQuery metod för att hämta hem JSON
    $.getJSON(url, function(response){
        
        //response innehåller all data från JSON
        //i vårat fall så är cars ett objekt med ett flertal objekt under sig
        let cars = response.cars;
        //Används för att sätta id på knapparna som appendas som motsvarar namnen i objektet cars
        //Kunde ha använt sig av key+1 också
        let btnId = 0;

        $.each(cars, function(key,value){

            btnId++; //ökar för att få car1,car2 osv
            carholder.append(`<div class="card flex-row flex-wrap">
                                <div class="card-header border-0">
                                    <img class="car-image" src="${value.img}" alt="${value.model}">
                                </div>
                                <div class="card-block pl-5">
                                    <h4 class="card-title">${value.model}</h4>
                                    <p class="card-text">${value.info}</p>
                                    <p class="card-text">Pris : ${value.price} kr</p>
                                    <input type="number" id="quantity" min="1" value="1">
                                    <a id="car${btnId}" href="javascript:void(0)" class="btn btn-primary">Köp</a>
                                </div>
                            </div>`);
        });//each
        
        //Referens till varje knapp genom traversing som anropar saveCar
        let carBtn = carholder.children("div").children(":last-child").children(":last-child");
        carBtn.on('click', saveCar);
    })//getJson
    
}; //displayCars

//Funktionen anropas med click på knappar som finns på produktsidan
function saveCar(){
    let newArray = [];
    //Hämtar nödvändig data vid anrop(köp) genom traversing, för att spara data temporärt i en variabel
    let img = $(this).parentsUntil(carholder).children("div").children("img").attr("src");
    let title = $(this).parentsUntil(carholder).children("div").children("h4").text();
    let price = $(this).parentsUntil(carholder).children("div").children("p").last().text();
    //Tar bort "pris :" samt mellanslag
    price = price.slice(7,10) + price.slice(11,14)
    let quantity = $(this).parentsUntil(carholder).children("div").children("input").val();
    let id = this.id;
   
    //infoObjektet kommer ha datan som hämtas med traversingen ovanför
    let info =   {id: id, img: img, title: title, price : price, quantity : quantity,}
    
    //Detta körs om LS är tomt, då pushas första bil-objektet in med hjälp av push() metoden
    if(localStorage.length == 0){
        newArray.push(info);
        newArray = JSON.stringify(newArray)
        localStorage.setItem("order", newArray)
    }
    //Detta körs om det finns ett LS-item me nyckel "order" 
    else if(localStorage.getItem("order")){
       //Hämtar hem LS-objektet till matchArray och parsar
       let matchArray = localStorage.getItem('order');
       matchArray = JSON.parse(matchArray);
       
       //Loopar igenom allt som finns i matchArray(LS)
       for(let i = 0; i < matchArray.length; i++){
          //Hittar vi matchingen med matchArray ID(car1 osv) mot ID som hämtats från knapptryck
          //Så körs detta kodblock, som tar gamla värdet på quantity och lägger ihop med nya quantity
          // Sedan break för att hoppa ut ur loopen.
           if (matchArray[i].id === id){
                let currentQuant = Number(matchArray[i].quantity);
                let newQuant = Number(quantity);
                matchArray[i].quantity = currentQuant + newQuant;
                localStorage.setItem('order', JSON.stringify(matchArray))
                break;
              } 
            //Hittas ingenmatchning och kommit till slutet av loopen
            //Lägg till ett nytt bil-objekt i LS-arrayen
            //Break för att inte loopen ska fortsätta snurra och plussa på en quantity på denna  
            else if(i === matchArray.length - 1){
                matchArray.push(info);
                localStorage.setItem('order', JSON.stringify(matchArray));
                break;
            };
    };
};
}

//Referens till varukorgs diven
let varukorg = $("#varukorg-car");

//Function som loopar igenom LS och visar upp data från LS
function displayOrderedcars(){
    let orderedCars = localStorage.getItem('order');
    orderedCars = JSON.parse(orderedCars);
    //Om LS är tomt loopas inget
    if(orderedCars !== null){
        $.each(orderedCars, function(key,value){
            varukorg.append(`<div class="card flex-row flex-wrap">
                            <div class="card-header border-0">
                                <img class="car-image" src="${value.img}" alt="">
                            </div>
                            <div class="card-block pl-5">
                                <h4 class="card-title">${value.title}</h4>
                                <p class="card-text">Pris :${value.price}</p>
                                <input type="number" min="1" value="${value.quantity}" data-id="${key}">
                                <a id="${key}" href="javascript:void(0)" class="btn btn-danger">Ta bort</a>
                            </div>
                        </div>`);
        });//each
    }//if
    else{
        varukorg.append(`<p> Du har inte köpt nån bil än </p>`)
    }//else

    //referens till tabort knapp
    let deleteBtn = varukorg.children("div").children(":last-child").children('a');
    
    //Function för att ta bort en bil ur varukorgen
    deleteBtn.on('click', function(){
        
        //clickedID kommer att ha id på knappen man tryckt på, som kommer användas i IF/else statement nedanför
        let clickedId = this.id
        //Traversing till knappens övre element för att gömma "kortet"
        let carContainer = $(this).parents(".card");
        carContainer.hide(500);
        //Gömmer hela varukorgen för att sedan vissa den igen, förklaring varför finns nedanför i else-blocket
        varukorg.children().hide();
        
        //Om det är sista bilen i localStorage så rensa allt för att få 
        //if statement på rad 59 att fungera(skapa första instance i localstorage)
        if(orderedCars.length === 1){
            localStorage.clear();
        }
        else{
            //Splice på arreyn med hjälp av id från knappen man trycker på
            //Funktionen returnerar de borttagna elementet till deletedCars
            // Överkurs, man skulle kunna använda deletedCars för att få in nån ångra funktion i varukorgen 
            let deletedCars = orderedCars.splice(clickedId,1);
            orderedCars = JSON.stringify(orderedCars);
            localStorage.setItem('order', orderedCars)
            //Skriv ut orderedCars igen för att matcha clickedId med index i LS arrayen orderedCars
            displayOrderedcars();
        }

    });
    //Referens till inputfield
    let inputField = varukorg.children("div").children(":last-child").children("input");
    
    //Funktion som ändrar quantity i varukorgen
    $(inputField).on('change', changeValue)

        function changeValue(){
            //Hämtar hem id som matcher sin plats i localStorage arrayen
            //Satt ett data-id här för att slippa traversa till ta-bort knappen
            let id = $(this).attr("data-id")
            //Nya värdet
            let newQuant = this.value;

            let changeValArray = localStorage.getItem('order')
            changeValArray = JSON.parse(changeValArray);
            //Loopar igenom LS arrayen för att hitta matching på id till key
            //Så att det är rätt data man ändrar
            $.each(changeValArray,function(key,value){
                if(key == id){
                    value.quantity = newQuant;
                    localStorage.setItem('order', JSON.stringify(changeValArray));
                    
                }//if
            })//each changeValArray
        }//changeValue
};//displayorderedcars




//Rensa varukorgen 
let clear = $('#clear')
clear.click(clearV);
function clearV(){
    varukorg.children().hide();
    localStorage.clear();
}

//Function to check the form and validate it
//When form is complete and buy button is pressed the complete buy pop-up comes
function CheckForm() {
    let nCheck
    let tCheck
    let aCheck
    let eCheck
    
    //namevalidation
    $('#namn').keyup(() => {
        let confName = /^[a-öA-Ö\s]{2,30}$/;
        let name = $('#namn').val()
        if (confName.test(name)) {
            nCheck = true;
            $("#namn").css({"border": "3px solid green"})
            $("#namn").nextUntil("input").hide(100)
        }
        else {
            $("#namn").css({"border": "3px solid red"})
            $("#namn").nextUntil("input").show(100)
            eCheck = false;
        }
    })
    //Adress validation
    $('#adress').keyup(() => {
        let confAdress = /^[a-öA-Ö0-9\s,'-]{5,100}$/;
        let adress = $('#adress').val()
        if (confAdress.test(adress)) {
            aCheck = true;
            $("#adress").css({"border": "3px solid green"})
            $("#adress").nextUntil("input").hide(100)
        }
        else {
            $("#adress").css({"border": "3px solid red"})
            $("#adress").nextUntil("input").show(100)
            eCheck = false;
        }
    })
    //Phone validation
    $('#telefon').keyup(() => {
        let confTel = /^[0-9]{8,12}$/;
        let telefon = $('#telefon').val()

        if (confTel.test(Number(telefon))) {
            tCheck = true;
            $("#telefon").css({"border": "3px solid green"})
            $("#telefon").nextUntil("input").hide(100)            

        }
        else {
            $("#telefon").css({"border": "3px solid red"})
            $("#telefon").nextUntil("input").show(100)
            eCheck = false;
        }
    })
    //email validation
    $('#mail').keyup(() => {
        let confEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

        let email = $('#mail').val()
        if (confEmail.test(email)) {
            eCheck = true;
            $("#mail").css({"border": "3px solid green"})
            $("#mail").nextUntil("button").hide(100)
        }
        else {
            $("#mail").css({"border": "3px solid red"})
            $("#mail").nextUntil("button").show(100)
            eCheck = false;
        }
    })

    //Checks if all the fields have been correctly submitted, if so the button get enabled
    $("#form").keyup(() => {
        if (tCheck == true && nCheck == true && aCheck == true && eCheck == true && localStorage.getItem('order')) {
            $("#final-buy").removeAttr("disabled")
        } else {

            $("#final-buy").attr("disabled", "true");
        }
    })
};

//Orderbekräftelse
//Function för utskrift av orderbekräftelse
$("#final-buy").click(function (){
    //Hide för att orderbekräftelsen ska ta varukorgen och formulärets plats
    varukorg.hide();
    clear.hide();
    $('#costumer-form').hide();

    let finalArray = localStorage.getItem('order');
    finalArray = JSON.parse(finalArray);
    $('#confirm-order').append(`<div class="card flex-row flex-wrap">
                                    <h1>Tack för ditt köp, här är din bekräftelse</h1>
                                </div>`)
    //Loopar igenom LS arrayen och appendar varje item till confirm-order div.                          
    $.each(finalArray, function(key,value){
        $('#confirm-order').append(`   <div class="card flex-row flex-wrap"> 
                                         <div class="card-header border-0">
                                            <img class="car-image" src="${value.img}" alt="">
                                         </div>
                                         <div class="card-block pl-5">
                                            <h4 class="card-title">${value.title}</h4>
                                            <p class="card-text">Pris per st :${value.price}</p>
                                            <p class="card-text">Ditt antal: ${value.quantity}</p>
                                            <p class="card-text">Ditt pris:${value.quantity * value.price}</p>
                                            
                                         </div>
                                        </div>`);                                
    })//each
    localStorage.clear();
})//finalbuy