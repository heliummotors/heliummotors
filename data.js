
const DEFAULT_VEHICLES = [
 {id:1,title:"Mercedes-Benz GLE 450",year:"2024",km:"18 500 km",price:"Prix sur demande",image:"car-1.svg",status:"Disponible"},
 {id:2,title:"Porsche Cayenne Coupé",year:"2023",km:"24 000 km",price:"Prix sur demande",image:"car-2.svg",status:"Sur commande"},
 {id:3,title:"Range Rover Sport",year:"2022",km:"31 700 km",price:"Prix sur demande",image:"car-3.svg",status:"Disponible"}
];
const DEFAULT_REVIEWS = [
 {id:1,name:"Client Hélium Motors",rating:5,text:"Excellent accompagnement du début à la fin. Le véhicule correspond parfaitement à mes attentes.",vehicle:"Mercedes-Benz GLE 450",image:"car-1.svg"},
 {id:2,name:"Client Hélium Motors",rating:5,text:"Service professionnel, réactif et transparent. Je recommande Hélium Motors.",vehicle:"Porsche Cayenne Coupé",image:"car-2.svg"},
 {id:3,name:"Client Hélium Motors",rating:5,text:"Importation parfaitement coordonnée et livraison dans de très bonnes conditions.",vehicle:"Range Rover Sport",image:"car-3.svg"}
];
function getVehicles(){return JSON.parse(localStorage.getItem("hm_vehicles")||JSON.stringify(DEFAULT_VEHICLES))}
function saveVehicles(v){localStorage.setItem("hm_vehicles",JSON.stringify(v))}
function getReviews(){return JSON.parse(localStorage.getItem("hm_reviews")||JSON.stringify(DEFAULT_REVIEWS))}
function saveReviews(v){localStorage.setItem("hm_reviews",JSON.stringify(v))}
