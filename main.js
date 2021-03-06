var spinnerContainer = document.getElementById("spinner-container");
var map = L.map('map').setView([ 42.9946,  -75.9704], 8);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
   attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
   subdomains: 'abcd',
   maxZoom: 20,
   minZoom: 0
}).addTo(map);

// map layers
var k12Schools = L.geoJSON(null, {
   onEachFeature:function(feature, layer) {
      let popupString = "<div class='popup-content'><h6 class='title'>"+ feature.properties.LABEL_NAME +"</h6>"+
      // "<p><b>Address</b>"+ feature.properties.PHYSADDR_1+"</p>"+
      "<table>"+
      "<tr>"+
       "<td class='itemKey'>Institution ID</td><td class='itemValue'>"+ feature.properties.INSTIT_ID+"</td>"+
      "</tr>"+
      "<tr>"+
       "<td class='itemKey'>SED Code</td><td class='itemValue'>"+ feature.properties.SED_CODE +"</td>"+
      "</tr>"+
      "<tr>"+
       "<td class='itemKey'>Labels</td><td class='itemValue'>"+ feature.properties.COUNTY_DES +"</td>"+
      "</tr>"+
      "<tr>"+
       "<td class='itemKey'>Grade Organization</td><td class='itemValue'>"+ feature.properties.GRADE_ORGA +"</td>"+
      "</tr>"+
      "<tr>"+
       "<td class='itemKey'>Address</td><td class='itemValue'>"+ feature.properties.PHYSADDR_1 +"</td>"+
      "</tr>"+
      "<tr>"+
       "<td class='itemKey'>City</td><td class='itemValue'>"+ feature.properties.PHYSCITY +"</td>"+
      "</tr>"+  
      "<tr>"+
       "<td class='itemKey'>State</td><td class='itemValue'>"+ feature.properties.PHYSICALST +"</td>"+
      "</tr>"+  
      "<tr>"+
       "<td class='itemKey'>Zone Code</td><td class='itemValue'>"+ feature.properties.PHYSZIPCD5 +"</td>"+
      "</tr>"+
      "<tr>"+
       "<td class='itemKey'>BOCES Code</td><td class='itemValue'>"+ feature.properties.BOCES_CODE +"</td>"+
      "</tr>"+
      "<tr>"+
       "<td class='itemKey'>Accountability Status</td><td class='itemValue'>"+ feature.properties.ACC_STATUS +"</td>"+
      "</tr>"+      
      "</table>"+
      "</div>";

      layer.bindPopup(popupString)
   },
   pointToLayer:function(feature, latLng) {
      let acc_status = feature.properties.ACC_STATUS;
      let color = acc_status == "GS" ? "#1a9641" : acc_status == "CSI" ? "#fdae61" : acc_status == "TSI" ? "#d7191c" : 'tranparent';
      
      let divIcon = L.divIcon({
         // className:'map-marker',
         html:"<div class='map-marker' style='background-color:" + color + "'></div>"
      });

      return L.marker(latLng, {icon:divIcon});
   }
});

var schoolDistrict= L.geoJSON(null, {
   onEachFeature:function(feature, layer) {
      let popupString = "<div class='popup-content'><h6 class='title'>"+ feature.properties.SchDist +
      "</h6></div>";

      layer.bindPopup(popupString)
   },
   style:function(feature) {
      return {
         weight:1,
         fillColor:'#db1554',
         color:'#fff'
      };

   }
}).addTo(map);

var incomeLevel = L.geoJSON(null, {
   style:function(feature) {
      return {
         fillColor:getIncomeColor(feature.properties['Median Income (2018)']),
         fillOpacity:0.9,
         weight:0.7,
         color:"#fff"
      }
   },
   onEachFeature:function(feature, layer) {
      let popupString = "<div class='popup-content'><h6 class='title'>"+ feature.properties.NAME_2 +"</h6>"+
         createPopupInfo(feature.properties) +
      "</div>";

      layer.bindPopup(popupString)
   }
}); 

function getIncomeColor(income) {
   let colors = ['#fde0c5','#facba6','#f8b58b','#f59e72','#f2855d','#ef6a4c','#eb4a40'];

   income = income ? income.toString().replace(",", "") : "";
   income = parseFloat(income) != NaN ? parseFloat(income) : "";

   return !income ? colors[0] : income < 51000 ? colors[1] : income < 58000 ? colors[2] : income < 67000 ? colors[3] 
      : income < 81000 ? colors[4] : income < 97000 ? colors[5] : colors[6];
}


var covid19Rates = L.geoJSON(null, {
   style:function(feature) {
      return {
         fillColor:getCovidColor(feature.properties["# of Positive Cases"]),
         fillOpacity:0.8,
         weight:0.7,
         color:"#ddd"
      }  
   },
   onEachFeature:function(feature, layer) {
      let popupString = "<div class='popup-content'><h6 class='title'>"+ feature.properties.NAME_2 +"</h6>"+
         createPopupInfo(feature.properties) +
      "</div>";

      layer.bindPopup(popupString)
   }
});

function getCovidColor(cumCount) {
   let colors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#b10026'];

   if(!cumCount ) return colors[0];

   return cumCount < 100 ? colors[0] : cumCount < 500 ? colors[1] : cumCount < 1000 ? colors[3] : cumCount < 5000 ? colors[4] :
   cumCount < 10000 ? colors[5] : cumCount < 15000 ? colors[6] : colors[7];
}

var broadbandAccess = L.geoJSON(null);   
var demographics = L.geoJSON(null);  
var csiTsiSchools = L.geoJSON(null);


function createPopupInfo(properties) {
   let tableElement = document.createElement('table');
   let keys = Object.keys(properties);

   keys.forEach((key) => {
      let tableRow = document.createElement('tr');
      tableRow.innerHTML = "<td class='itemKey'>"+ key +"</td><td class='itemValue'>"+ properties[key]+"</td>";

      tableElement.append(tableRow)
   });

   return tableElement.outerHTML;
};

// load map layers
let layers = [k12Schools, schoolDistrict, incomeLevel, covid19Rates, broadbandAccess, demographics, demographics, csiTsiSchools];
let dataUrls = ['publick12.geojson', 'schooldistrict_boundary.geojson','income_data.geojson', 'covid.geojson'];


dataUrls.forEach((url, index) => {
   // fetch the data
   fetch(`geojson/${url}`)
   .then(res => res.json())
   .then(data  => {
      // console.log(data);

      if(index == 1) {
         spinnerContainer.style.display = "none";
      }
      
      console.log(index);
      layers[index].addData(data);
      // .addTo(map);
   })
   .catch(error => {
      console.error(error);
   });
});

// Income level legend
var legendControl = new L.Control({position:"bottomright"});
legendControl.onAdd = function(map) {
    let div = L.DomUtil.create("div", "accordion bg-white");

    div.innerHTML += '<button class="btn btn-block bg-light text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">'+
    'Income Levels</button>';
   
    let values = ["", 50000, 57000, 66000, 80000, 96000, 105000];
    let labels = ['Unknown',' < 51000',  '< 66000', '< 80000', '< 96000', '< 105000'];

    let legendItems = "";
    values.forEach((value, index) => {
        let color = getIncomeColor(value);
        let name = labels[index]
        legendItems += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+color+"'></div><span>"+name+"</span></div>";
    });

    div.innerHTML += '<div class="collapse" id="collapseOne">'+ legendItems +'</div>';

    return div;
}

// legendControl.addTo(map);


// Covid 19 level legend
var covid19LegendControl = new L.Control({position:"bottomleft"});
covid19LegendControl.onAdd = function(map) {
    let div = L.DomUtil.create("div", "accordion bg-white");

    div.innerHTML += '<button class="btn btn-block bg-light text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">'+
    'Cumulative Number of Positives</button>';
   
    let values = [0, 100, 500, 1000, 5000, 10000, 15000, 20000];
    let labels = ["0-99", "100-499", "500 - 999", "1000 - 4999", "5000 - 9999", "10000 - 14999", "15000 - 19999", "20000 + "];

    let legendItems = "";
    values.forEach((value, index) => {
        let color = getCovidColor(value);
        let name = labels[index]
        legendItems += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+color+"'></div><span>"+name+"</span></div>";
    });

    div.innerHTML += '<div class="collapse" id="collapseOne">'+ legendItems +'</div>';

    return div;
}

// K12 schools
var k12SchoolsLegend = new L.control({position:'bottomleft'});
k12SchoolsLegend.onAdd = function(map) {
   let div = L.DomUtil.create("div", "accordion bg-white");

    div.innerHTML += '<button class="btn btn-block bg-light text-left" type="button" data-toggle="collapse" data-target="#collapseK12" aria-expanded="true" aria-controls="collapseOne">'+
    'Public K12 Schools</button>';

    let labels = ["GS", "CSI", "TSI", "Other"];
    let colors = ["#1a9641" , "#fdae61", "#d7191c", "#fff"];

    let legendItems = "";
    labels.forEach((value, index) => {
        let color = colors[index];
        legendItems += "<div class='legend_wrapper'><div class='legend-item' style='background-color:"+ color +"'></div><span>"+ value +"</span></div>";
    });

    div.innerHTML += '<div class="collapse" id="collapseK12">'+ legendItems +'</div>';

    return div;
}

// event listeners
map.on('overlayremove', function(e) {
   if(e.name == "Income Levels") {
      map.removeControl(legendControl);
   } else if (e.name == "Public K12 Schools") {
      map.removeControl(k12SchoolsLegend); 
   }
   else if (e.name == "COVID-19 Cumulative Cases") {
      map.removeControl(covid19LegendControl);  
   }
});

map.on('overlayadd', function(e) {
   if(e.name == "Income Levels") {
     legendControl.addTo(map);
   } else if (e.name == "Public K12 Schools") {
      map.addControl(k12SchoolsLegend); 
   } else if (e.name == "COVID-19 Cumulative Cases") {
      map.addControl(covid19LegendControl);  
   }
});


// Labels
var collisionLayer = L.LayerGroup.collision({margin:5});
fetch('geojson/county_names.geojson')
.then(res => res.json())
.then(data => {
   console.log("names");

   data.features.forEach(feat => {
      var marker = L.marker(L.GeoJSON.coordsToLatLng(feat.geometry.coordinates), {
         icon: L.divIcon({
            html:
               "<span class='marker-labels'>" +
                  feat.properties.NAME_2 +
               "</span>"
         })
         ,interactive: false	// Post-0.7.3
         ,clickable:   false	//      0.7.3
         });

      collisionLayer.addLayer(marker);
   });

   collisionLayer.addTo(map);

}) 
.catch(error => {
   console.error(error);
});

// uncompress the data
var broadband = L.geoJSON(null, {
   style:function(feature) {
      return {
         fillColor:'#729b6f',
         fillOpacity:0.6,
         color:'#ddd',
         weight:0.5
      }
   }
}).addTo(map);

fetch('geojson/broadband.pbf', { responseType:'ArrayBuffer'})
.then(res => res.arrayBuffer())
.then(data => {
   console.log("PBF file");
   console.log(data);

   var geojson = geobuf.decode(new Pbf(data));
   // console.log(geojson);
   broadband.addData(geojson);
})
.catch(error => {
   console.error(error);
});

// map layers
var overlay = {
   'Public K12 Schools':k12Schools,
   'School District Boundary': schoolDistrict,
   'Income Levels':incomeLevel,
   'COVID-19 Cumulative Cases':covid19Rates,
   'Broadband Availability':broadband
}

L.control.layers({},overlay, {collapsed:false}).addTo(map);
