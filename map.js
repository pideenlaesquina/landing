// Note: This script requires that you consent to location sharing when
// prompted by your browser. If you did not gave permission for the browser 
// or the browser does not support geolocation it will use https://ip-api.com/
// service to locate you.

var map, infoWindow, isCall, callnumber;

/*
 * Creates the map centered to the user's location
 */ 
async function initMap() {
  var pos = await getInitialPosition();
  
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 15,
  });

  infoWindow = new google.maps.InfoWindow();

  var userPos = getUserPosition();
  if(userPos)
  {
    loadMapData(userPos);
  }
  else
  {
    loadMapData(pos);
  }
}

async function loadMapData(pos, initial=true)
{
  if(initial)
  {
    addMarker("user", pos.lat, pos.lng, "user", "Tu ubicación", null, null, null, null, true);
  }

  map.panTo(pos);
  var stores = await getStores(pos);

  //TODO: issue#7 Agregar control que muestra mensaje "lo sentimos no hay tiendas cerca de tí, agrega la primera"
  for (var i = 0; i < stores.length; i++) {
    addMarker(stores[i].id, stores[i].lat, stores[i].lng, stores[i].type, stores[i].name, stores[i].address, stores[i].cellphone, stores[i].phone, stores[i].aceptsCreditCard);
  };
}

function addMarker(id,lat, lng, markerType, name, address, cellphone, phone, aceptsCreditCard, draggable=false)
{
  var icon_normal = './images/store_icon.svg';
  var icon_hover = './images/store_icon_hover.svg';

  if (markerType != null)
  {
    icon_normal = './images/' + markerType.toLowerCase() + "_icon.svg";
    icon_hover = './images/' + markerType.toLowerCase() + "_icon_hover.svg";
  }

  var marker = new google.maps.Marker({
      position: {lat:lat, lng:lng},
      icon: icon_normal,
      title:name,
      draggable:draggable,

      //custom data
      id:id,
      name:name,
      address:address,
      type:markerType.toLowerCase(),
      cellphone:cellphone,
      phone:phone,
      aceptsCreditCard: aceptsCreditCard
  });

  if(marker.id=="user")
  {
    infoWindow.setContent(
      '<div id="content">'+
        '<p>Arrastra este cursor para cargar las tiendas cercanas</p>'+
      '</div>'
    );
    infoWindow.open(map, marker); 
  }

  google.maps.event.addListener(marker, 'click', function() {
    if(marker.id != "user")
    {
      infoWindow.setContent(
        '<div id="content">'+
          '<h4 id="firstHeading" class="firstHeading">'+ marker.name +'</h4>'+
          '<p>'+ marker.address +'</p>'+
          (marker.aceptsCreditCard?'<p><i class="fa fa-credit-card"></i> Acepta tarjetas</p>':"")+
          '<div class="map-button-block">'+
            '<button class="map-button phone" type="submit" value="Call" onclick="callAction('+marker.phone+')"><i class="fa fa-phone"></i> Llamar</button>'+
            '<button class="map-button whatsapp" type="submit" value="Write" onclick="writeAction('+marker.cellphone+')"><i class="fa fa-whatsapp"></i> Escribir</button>'+
          '</div>'+
        '</div>'
      );
      infoWindow.open(map, marker); 
    }                     
  });

  google.maps.event.addListener(marker, 'mouseover', function() {
    marker.setIcon(icon_hover);
  });

  google.maps.event.addListener(marker, 'mouseout', function() {
    marker.setIcon(icon_normal);    
  });

  google.maps.event.addListener(marker, 'dragend', function(event) {
    loadMapData({ lat: Number(event.latLng.lat().toFixed(6)) , lng: Number(event.latLng.lng().toFixed(6)) });
  });

  marker.setMap(map);
}

function getUserPosition()
{
  var coordinates = null;

  //Updated from browser
  if (navigator.geolocation) 
  {
    coordinates = navigator.geolocation.getCurrentPosition(function(position) {
      loadMapData({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    }, function() {
      return null;
    });
  }

  return coordinates;
}

/*
 * Obtains the user's location from ip address
 */
async function getInitialPosition()
{
  var pos = {lat:4.603843 , lng: -74.062705};
  var ip = await fetch('https://api.ipify.org').then(response=>response.text()); 
  pos = await fetch('http://ip-api.com/json/'+ip+'?fields=lat,lon').then(response=>response.json());
  return {lat:parseFloat(pos.lat), lng:parseFloat(pos.lon)};
}

async function getStores(pos)
{
  let url = 'https://front-iota.now.sh/api/stores?lat='+ pos.lat +'&lng='+pos.lng
  let stores = await fetch(url).then(response=>response.json());
  return stores.stores;
  // return [
  //   {id:1, lat:4.729530, lng:-74.035120, type:"pharmacy", name:"Droguería SuperFarma", address:"Calle 151 # 13 -80", cellphone:"3124444444", phone:"5678990", aceptsCreditCard:true},
  //   {id:2, lat:4.730225, lng:-74.036091, type:"bakery", name:"Panadería buen pan", address:"Calle 151 # 13 -80", cellphone:"3124444444", phone:"5678990", aceptsCreditCard:false},
  //   {id:3, lat:4.730308, lng:-74.036815, type:"minimarket", name:"Vennetodo", address:"Calle 151 # 13 -80", cellphone:"3124444444", phone:"5678990", aceptsCreditCard:false},
  //   {id:4, lat:4.730741, lng:-74.037866, type:"butchery", name:"Carnes el Cedro", address:"Calle 151 # 13 -80", cellphone:"3124444444", phone:"5678990", aceptsCreditCard:true}
  // ];
}



function fetchHandleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

//MODALS
// Get the modal
var infoModal = document.getElementById("infoModal");
var contactModal = document.getElementById("contactModal");

// Get the button that opens the modal
var infoBtn = document.getElementById("info");

// Get the <span> element that closes the modal
var infoModalSpan = document.getElementById("infoModalClose");
var contactModalSpan = document.getElementById("contactModalClose");

// When the user clicks the button, open the modal 
infoBtn.onclick = function() {
  infoModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
contactModalSpan.onclick = function() {
  contactModal.style.display = "none";
}
infoModalSpan.onclick = function() {
  infoModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == infoModal) {
    infoModal.style.display = "none";
  }
}

const contactForm = document.getElementById('form-contact');
contactForm.addEventListener('submit', function(event){
  event.preventDefault();
  saveUser();
  contactModal.style.display = "none";
  if (isCall)
  {
    callAction(callnumber);
  }
  else
  {
    writeAction(callnumber);
  }
});

function checkCookies()
{
  //TODO issue#10 check if cookie exists with user id
  return true;
}

function logUserActivity(type)
{
  //TODO issue#11 Log user activity in database using user id stores in cookie
}

function saveUser()
{
  //TODO issue#9 Post user data to database and create cookie with user id
}

function callAction(number)
{
  isCall = true;
  callnumber = number;
  if(!checkCookies())
  {
    contactModal.style.display = "block";
  }
  else
  {
    logUserActivity("call");
    window.open("tel:031"+callnumber);
  }
}

function writeAction(number)
{
  isCall = false;
  callnumber=number;
  if(!checkCookies())
  {
    contactModal.style.display = "block";
  }
  else
  {
    logUserActivity("write");
    window.open("https://wa.me/57"+callnumber+"?text=¡Hola!%20Vi%20tu%20tienda%20en%20Pideenlaesquina.com%20y%20quiero%20hacer%20un%20pedido.");
  }
}