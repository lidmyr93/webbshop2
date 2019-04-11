$(document).ready(function(){
    displayCars();
    displayOrderedcars();
    CheckForm();
});//Ready
/* let orderedCars = localStorage.getItem('order1'); */
let carholder = $('#carholder');

function displayCars(){
    let url = "cars.json";
    
    $.getJSON(url, function(response){
        
        let cars = response.cars;
        let btnId = 0;
        $.each(cars, function(key,value){
            /* console.log(value.name); */
            /* "model"
            "info"
            "img" 
            "price" */
            btnId++;
            carholder.append(`<div class="card flex-row flex-wrap">
            <div class="card-header border-0">
            <img class="car-image" src="${value.img}" alt="${value.model}">
            </div>
            <div class="card-block pl-5">
            <h4 class="card-title">${value.model}</h4>
            <p class="card-text">${value.info}</p>
            <p class="card-text">Pris : ${value.price} kr</p>
            <input type="number" id="quantity" min="1" value="1">
            <a id="car${btnId}" href="#" class="btn btn-primary">Köp</a>
            </div>
            </div>`);
        });//each
        
        
        let carBtn = carholder.children("div").children(":last-child").children(":last-child");
        carBtn.on('click', saveCar);
    })//getJson
    
}; //displayCars

function saveCar(){
    let newArray = [];
    let img = $(this).parentsUntil(carholder).children("div").children("img").attr("src");
    let title = $(this).parentsUntil(carholder).children("div").children("h4").text();
    let price = $(this).parentsUntil(carholder).children("div").children("p").last().text();
    //Tar bort "pris :" så bara sparar själva priset
    price = price.slice(7,10) + price.slice(11,14)
    console.log(price);
    let quantity = $(this).parentsUntil(carholder).children("div").children("input").val();
    let id = this.id;
    /* console.log(carholder.children("div").children(":last-child").children(":last-child").id); */
    console.log(id);
    //infoArray kommer ha info om bilen du tryckt på temporärt
    let info =   {id: id, img: img, title: title, price : price, quantity : quantity,}
    /* console.log(newArray); */
    
    
  
    if(localStorage.length == 0){
        newArray.push(info);
        newArray = JSON.stringify(newArray)
        localStorage.setItem("order", newArray)
    }
    else if(localStorage.getItem("order")){
       //Hämta hem localstorage loopa igenom och kolla id om det matchar i såntfall öka quantity
       let matchArray = localStorage.getItem('order');
       matchArray = JSON.parse(matchArray);
       console.log(matchArray)
       for(let i = 0; i < matchArray.length; i++){
           console.log(matchArray[i].id, id);
           if (matchArray[i].id === id){
               //plusa på quantity
                let currentQuant = Number(matchArray[i].quantity);
                let newQuant = Number(quantity);
                matchArray[i].quantity = currentQuant + newQuant;
                localStorage.setItem('order', JSON.stringify(matchArray))
                break;
              }   
            else if(i === matchArray.length - 1){
                matchArray.push(info);
                localStorage.setItem('order', JSON.stringify(matchArray));
                break;
            };
    };
};
}


let varukorg = $("#varukorg-car");

function displayOrderedcars(){
    let orderedCars = localStorage.getItem('order');
    orderedCars = JSON.parse(orderedCars);
    if(orderedCars !== null){
        $.each(orderedCars, function(key,value){
            varukorg.append(`<div class="card flex-row flex-wrap">
                            <div class="card-header border-0">
                                <img class="car-image" src="${value.img}" alt="">
                            </div>
                            <div class="card-block pl-5">
                                <h4 class="card-title">${value.title}</h4>
                                <p class="card-text">${value.price}</p>
                                <input type="number" min="1" value="${value.quantity}" data-id="${key}">
                                <a id="${key}" href="#" class="btn btn-danger">Ta bort</a>
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
        //Traversing till knappens övre element för att gömma kortet
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
            // Splice the array from localStorage with this id , it will return the removed item, save that to a variable to kill off.
            //Splice på arreyn med hjälp av id från knappen man trycker på
            //Funktionen returnerar de borttagna elementet till deletedCars
            // Överkurs, man skulle kunna använda deletedCars för att få in nån ångra funktion i varukorgen 
            let deletedCars = orderedCars.splice(clickedId,1);
            orderedCars = JSON.stringify(orderedCars);
            localStorage.setItem('order', orderedCars)
            //Skriv ut orderedCars igen för att matcha clickedId med index i localStorage arrayen orderedCars
            displayOrderedcars();
        }

    });
    let inputField = varukorg.children("div").children(":last-child").children("input");
    console.log(inputField);
    $(inputField).on('change', changeValue)
    
    
        function changeValue(){
            //Hämtar hem id som matcher sin plats i localStorage arrayen
            let id = $(this).attr("data-id")
            let newQuant = this.value;
            console.log(id, newQuant);

            let changeValArray = localStorage.getItem('order')
            changeValArray = JSON.parse(changeValArray);
            $.each(changeValArray,function(key,value){
                /* console.log(key);
                console.log(value); */
                if(key == id){
                    console.log('hej');
                    console.log(value.quantity);
                    value.quantity = newQuant;
                    console.log(value.quantity);
                    localStorage.setItem('order', JSON.stringify(changeValArray));
                    
                }
            })
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

$("#final-buy").click(function (){
    varukorg.hide();
    clear.hide();
    $('#costumer-form').hide();
    let finalArray = localStorage.getItem('order');
    finalArray = JSON.parse(finalArray);
    $('#confirm-order').append(`<div class="card flex-row flex-wrap">
                                    <h1>Tack för ditt köp, här är din bekräftelse</h1>
                                </div>`)
    $.each(finalArray, function(key,value){
        console.log(typeof value.quantity);
        console.log(typeof value.price);
        $('#confirm-order').append(`   <div class="card flex-row flex-wrap"> 
                                         <div class="card-header border-0">
                                            <img class="car-image" src="${value.img}" alt="">
                                         </div>
                                         <div class="card-block pl-5">
                                            <h4 class="card-title">${value.title}</h4>
                                            <p class="card-text">${value.price}</p>
                                            <p class="card-text">Ditt antal: ${value.quantity}</p>
                                            <p class="card-text">Ditt pris:${value.quantity * value.price}</p>
                                            
                                         </div>
                                        </div>`);                                
    })//each
    localStorage.clear();
})//finalbuy