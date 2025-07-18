// Base tile layers
const street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: '© Esri'
});

const map = L.map('map', {
  center: [43.637869, -79.406311],
  zoom: 13,
  layers: [street, satellite] // default layers
});

// Boundary pane
map.createPane('topPane');
map.getPane('topPane').style.zIndex = 650;

// Load GTA boundary
fetch('toronto_bound.json')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pane: 'topPane',
      style: { color: '#ffd300', weight: 4, fillOpacity: 0, dashArray: '6,6' }
    }).bindPopup('Toronto Regional Boundary').addTo(map);
  })
  .catch(err => console.error('Failed to load boundary:', err));

// Geocoder control
L.Control.geocoder({ defaultMarkGeocode: false, position: 'topleft' })
  .on('markgeocode', e => map.setView(e.geocode.center, 16))
  .addTo(map);

// Custom marker icon
const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Load and parse marker CSV
Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vTrYopwENfaG6flpsO9kaeUmBnutaETaCQgasAR-S6udJ-zlt2KazlgM5lL-kt5g4vE8X9_Jl3yb5hk/pub?output=csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: results => {
    const morning = L.layerGroup();
    const afternoon = L.layerGroup();
    const evening = L.layerGroup();
    const night = L.layerGroup();
    const bentway = L.layerGroup();
    const artwork = L.layerGroup();

    // GP OVERLAY CODE: define Urban Heat Island Simulation overlay
    const ndviOverlay = L.imageOverlay(
      'toronto_ndvi_color_export_nd.png',
      [[43.581, -79.639], [43.855, -79.116]],
      { opacity: 0.65 }
    );

// Place markers into time-of-day groups
    results.data
      .filter(r => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
      .forEach(r => {
        const marker = L.marker([r.latitude, r.longitude], { icon: goldIcon });
        const defaultPopup = `<b>${r.name||'Unnamed'}</b><br>${r.latitude.toFixed(6)}, ${r.longitude.toFixed(5)}`;
        const detailedPopup = `
          <div style="width: 300px;">
                <b>${r.name || 'Unnamed'}</b><br>${r.latitude.toFixed(6)}, ${r.longitude.toFixed(5)}
                <p>${r.description || ''}</p>
                <p>A user identified this as a shady spot on ${r.timestamp || 'an unknown date'}.</p>
                <p>The best time to visit this spot is in the ${r.timeday || 'unknown'}.</p>
                <p>Upvotes container: ${r.upvotes || '0'}.</p>
                function submitUpvote(objectID, upvotes) {
                  const objectID = r.objectID.value;
                  const upvote = on button (thumbsup.png) click, send number 1 to entry}
                  sendToForm(objectID, upvotes)
                function sendToForm(objectID, upvotes) {
                  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLScX-UiKwpe_MIlSi1wGz5HPwISmZ5AqmfkAWJcLDsxyT5sHOg/formResponse";
                  const formData = new URLSearchParams();
                  formData.append("entry.1719527082", userID);
                  formData.append("entry.890823714", upvote);
                <p>Add upvotes:.</p>
              </div> 
            `;
        
        marker.bindPopup(defaultPopup);
        marker.on('dblclick', () => marker.getPopup().setContent(detailedPopup).openOn(map));
        marker.on('popupclose', () => marker.getPopup().setContent(defaultPopup));

        const time = (r.timeday||'').toLowerCase().trim();
        if (time === 'morning') marker.addTo(morning);
        else if (time === 'afternoon') marker.addTo(afternoon);
        else if (time === 'evening') marker.addTo(evening);
        else if (time === 'night') marker.addTo(night);
        else marker.addTo(night);
      });
    
        // BENTWAY PRELOAD COOL SPOTS

        // bentway studio
        const studio_marker = L.marker([43.63964, -79.39536], { icon: goldIcon }).addTo(bentway); 
        const studio_defaultPopup = `<b>${'Bentway Studio'}</b><br>${43.63964}, ${-79.39536}`;
        const studio_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway Studio'}</b><br>${'43.63964'}, ${'-79.39536'}
              <p>${'Venue open during community events and workshops. Air conditioned, wheelchair accessible, and equipped with washrooms.'}</p>
              <img src="${"photos/bentway_studio.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // strachan gate
        const strachan_marker = L.marker([43.63722, -79.40933], { icon: goldIcon }).addTo(bentway);
        const strachan_defaultPopup = `<b>${'Bentway Strachan Gate'}</b><br>${'43.63722'}, ${'-79.40933'}`; 
        const strachan_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway Strachan Gate'}</b><br>${'43.63722'}, ${'-79.40933'}
              <p>${'An ampitheatre shaded from the sun by the highway above, with space to breathe and play.'}</p>
              <img src="${"photos/strachan_gate.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // skate trail
        const skate_marker = L.marker([43.63794, -79.40633], { icon: goldIcon }).addTo(bentway); // skate trail
        const skate_defaultPopup = `<b>${'Bentway Skate Trail'}</b><br>${'43.63794'}, ${'-79.40633'}`;
        const skate_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway Skate Trail'}</b><br>${'43.63794'}, ${'-79.40633'}
              <p>${'This public space beneath an expressway hosts art shows, community events & summer roller skating. Equipped with water features for drinking and splashing. Wheelchair accessible and washrooms available during open hours.'}</p>
              <img src="${"photos/skate_trail.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // staging grounds
        const staging_marker = L.marker([43.63812, -79.39695], { icon: goldIcon }).addTo(bentway);
        const staging_defaultPopup = `<b>${'Bentway Staging Grounds'}</b><br>${'43.63812'}, ${'-79.39695'}`;
        const staging_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway Staging Grounds'}</b><br>${'43.63812'}, ${'-79.39695'}
              <p>${'Experimental extension to the main Bentway site, the Staging Grounds are sheltered from the sun and rain and feature unique ecological elements.'}</p>
              <img src="${"photos/staging_grounds.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // BENTWAY ARTWORK preloads

        // casting a net, casting a spell
        const spell_marker = L.marker([43.63760, -79.40564], { icon: goldIcon }).addTo(artwork);
        const spell_defaultPopup = `
        <b>${'Bentway: Sun/Shade Installation'}</b><br>
        <b><i>${'Casting a Net, Casting a Spell'}</b></i><br>
        ${'43.63760'}, ${'-79.40564'}
        `;
        const spell_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway: Sun/Shade Installation'}</b><br>
              <b><i>${'Casting a Net, Casting a Spell'}</b></i><br>
              ${'43.63760'}, ${'-79.40564'}
              <p>${'Artist duo Celeste’s majestic, quilted canopy casts welcomed shade down to a seating area below, offering relief from the heat and a space for gathering. Like a suncatcher, Casting a Net, Casting a Spell embraces and harnesses the sun, weaving in archetypes that have surrounded the sun since ancient times.'}</p>
              <img src="${"photos/celeste.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // bathed in a strange light
        const strangelight_marker = L.marker([43.63962, -79.39562], { icon: goldIcon }).addTo(artwork);
        const strangelight_defaultPopup = `
        <b>${'Bentway: Sun/Shade Installation'}</b><br>
        <b><i>${'Bathed in a Strange Light'}</b></i><br>
        ${'43.63962'}, ${'-79.39562'}
        `;
        const strangelight_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway: Sun/Shade Installation'}</b><br>
              <b><i>${'Bathed in a Strange Light'}</b></i><br>
              ${'43.63962'}, ${'-79.39562'}
              <p>${'Working in collaboration with the sun’s rhythms, Natalie Hunter’s photographs on the windows of The Bentway Studio (facing Canoe Landing Park) explore how ever-shifting sunlight shapes our experience of public spaces. As the sun moves throughout the day, translucent images cast down a colorful, slow-moving cinema.'}</p>
              <img src="${"photos/hunter.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // declaration of the understory
        const understory_marker = L.marker([43.63794, -79.39681], { icon: goldIcon }).addTo(artwork);
        const understory_defaultPopup = `
        <b>${'Bentway: Sun/Shade Installation'}</b><br>
        <b><i>${'Declaration of the Understory'}</b></i><br>
        ${'43.63794'}, ${'-79.39681'}
        `;
        const understory_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway: Sun/Shade Installation'}</b><br>
              <b><i>${'Declaration of the Understory'}</b></i><br>
              ${'43.63794'}, ${'-79.39681'}
              <p>${'Secwépemc artist Tania Willard approaches the space below the highway as a tree canopy, reminiscent of the “understory” floor of southern Ontario forests, where pockets of shade and sunlight shape unique ecosystems below. In a stunning mixed-media installation, floral motifs, iridescence, and powerful slogans offer a mediation on the power of shade as a lifeforce.'}</p>
              <img src="${"photos/willard.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // la sombra que te cobija
        const sombra_marker = L.marker([43.63770, -79.40415], { icon: goldIcon }).addTo(artwork);
        const sombra_defaultPopup = `
        <b>${'Bentway: Sun/Shade Installation'}</b><br>
        <b><i>${'la sombra que te cobija'}</b></i><br>
        ${'43.63770'}, ${'-79.40415'}
        `; 
        const sombra_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway: Sun/Shade Installation'}</b><br>
              <b><i>${'la sombra que te cobija'}</b></i><br>
              ${'43.63770'}, ${'-79.40415'}
              <p>${'A geometric pavilion invites you to cross under the Gardiner, casting both a cooling effect and ornate shadow patterns. Edra Soto’s installation references the shade-making façades of working-class Puerto Rican bungalows to create an expansive, sun-filtering threshold, reflecting on the intersection of heat-responsive architecture, place-making, and cultural heritage.'}</p>
              <img src="${"photos/soto.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // seeing celsius
        const celsius_marker = L.marker([43.63774, -79.40479], { icon: goldIcon }).addTo(artwork);
        const celsius_defaultPopup = `
        <b>${'Bentway: Sun/Shade Installation'}</b><br>
        <b><i>${'Seeing Celsius'}</b></i><br>
        ${'43.63774'}, ${'-79.40479'}
        `;
        const celsius_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway: Sun/Shade Installation'}</b><br>
              <b><i>${'Seeing Celsius'}</b></i><br>
              ${'43.63774'}, ${'-79.40479'}
              <p>${'What happens when we can see heat? By adding thermal-imaging technology to the familiar viewfinder found at scenic lookout points, LeuWebb Projects enables you to see the temperature differences across The Bentway space and the bodies that move through it. It’s a new perspective that will shift how you view urban spaces and the materials that shape them.'}</p>
              <img src="${"photos/leuwebb.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        // second shade
        const secondshade_marker = L.marker([43.63729, -79.40976], { icon: goldIcon }).addTo(artwork);
        const secondshade_defaultPopup = `
        <b>${'Bentway: Sun/Shade Installation'}</b><br>
        <b><i>${'Second Shade'}</b></i><br>
        ${'43.63729'}, ${'-79.40976'}`;
        const secondshade_detailedPopup = `
        <div style="width: 300px;">
              <b>${'Bentway: Sun/Shade Installation'}</b><br>
              <b><i>${'Second Shade'}</b></i><br>
              ${'43.63729'}, ${'-79.40976'}
              <p>${'Echoing both the towering structures of downtown skyscrapers and a forest of trees, Mary Mattingly’s Second Shade combines lush greenery and repurposed construction materials to make a unique 20ft tall urban canopy, showcasing the cooling potential of green roofs, soft landscaping, and responsive architecture.'}</p>
              <img src="${"photos/mattingly.jpg"}" width="100%" height="200" style="object-fit: cover;" />
        </div> 
        `;

        const markers = [studio_marker, strachan_marker, skate_marker, staging_marker,
          spell_marker, strangelight_marker, understory_marker, sombra_marker, celsius_marker, secondshade_marker
        ];
        const defaultPopups = [studio_defaultPopup, strachan_defaultPopup, skate_defaultPopup, staging_defaultPopup,
          spell_defaultPopup, strangelight_defaultPopup, understory_defaultPopup, sombra_defaultPopup, celsius_defaultPopup, secondshade_defaultPopup
        ];
        const detailedPopups = [studio_detailedPopup, strachan_detailedPopup, skate_detailedPopup, staging_detailedPopup,
          spell_detailedPopup, strangelight_detailedPopup, understory_detailedPopup, sombra_detailedPopup, celsius_detailedPopup, secondshade_detailedPopup
        ];


        markers.forEach((marker, i) => {
          marker.bindPopup(defaultPopups[i]);
            marker.on('dblclick', () => marker.getPopup().setContent(detailedPopups[i]).openOn(map));
            marker.on('popupclose', () => marker.getPopup().setContent(defaultPopups[i]));

        }); 
    
    // Add marker groups to map
    morning.addTo(map);
    afternoon.addTo(map);
    evening.addTo(map);
    night.addTo(map);
    bentway.addTo(map);
    artwork.addTo(map);

    const baseTree = {
      label: 'Base Maps',
      collapsed: true,
        children: [
          {label: 'Street View', layer: street, name: 'OSM'},
          {label: 'Satellite View', layer: satellite, name: 'ESRI'}  
        ]
    };

    
    const overlayTree = [
      {
        label: 'Heat Maps', 
        collapsed: true,
        children: [
          {label: 'Urban Heat Island', layer: ndviOverlay}
        ]
      },
      {
        label: 'Cool Spots',
        collapsed: false,
        children: [
          {label: 'Morning', layer: morning},
          {label: 'Afternoon', layer: afternoon},
          {label: 'Evening', layer: evening},
          {label: 'Night', layer: night},
          {label: 'Sun/Shade Art', layer: artwork},
        ]
      },  
    ];

    L.control.layers.tree(baseTree, overlayTree).addTo(map);
  },
  error: err => { console.error(err); alert('Failed to load markers.'); }
});

// interactibility!!!
