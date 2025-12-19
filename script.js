// ==========================================
// INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initDoublePulseCursor();
    initUrbanGrid();
    initGlobe();
    initBoliviaMap();
    initScrollAnimations();
    initAnimatedCoords();
    initSmoothScroll();
    initProjectImages();
});

// ==========================================
// CURSOR DOBLE PULSO
// ==========================================
function initDoublePulseCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const cursorPulse = document.querySelector('.cursor-pulse');
    
    if (!cursorDot || !cursorRing || !cursorPulse) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Punto central - sigue rápido
        dotX += (mouseX - dotX) * 0.2;
        dotY += (mouseY - dotY) * 0.2;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
        cursorDot.style.transform = 'translate(-50%, -50%)';

        // Anillo - sigue más lento
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        cursorRing.style.transform = 'translate(-50%, -50%)';

        // Pulso - sigue el anillo
        cursorPulse.style.left = ringX + 'px';
        cursorPulse.style.top = ringY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect en elementos interactivos
    const hoverElements = document.querySelectorAll('a, button, .skill-card, .project-card, .project-locations-list li, input');
    hoverElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursorDot.classList.add('hover');
            cursorRing.classList.add('hover');
        });
        el.addEventListener('mouseleave', function() {
            cursorDot.classList.remove('hover');
            cursorRing.classList.remove('hover');
        });
    });
}

// ==========================================
// ANIMACIONES DE VÍAS URBANAS
// ==========================================
function initUrbanGrid() {
    const urbanGrid = document.querySelector('.urban-grid');
    if (!urbanGrid) return;

    // Crear líneas horizontales
    for (let i = 0; i < 8; i++) {
        const lineH = document.createElement('div');
        lineH.className = 'urban-line urban-line-h';
        lineH.style.top = (10 + i * 12) + '%';
        lineH.style.animationDelay = (i * 0.8) + 's';
        urbanGrid.appendChild(lineH);

        // Punto de tráfico en la línea
        const dotH = document.createElement('div');
        dotH.className = 'traffic-dot traffic-dot-h';
        dotH.style.top = (10 + i * 12) + '%';
        dotH.style.animationDelay = (i * 1.2) + 's';
        dotH.style.animationDuration = (4 + Math.random() * 4) + 's';
        urbanGrid.appendChild(dotH);
    }

    // Crear líneas verticales
    for (let i = 0; i < 10; i++) {
        const lineV = document.createElement('div');
        lineV.className = 'urban-line urban-line-v';
        lineV.style.left = (5 + i * 10) + '%';
        lineV.style.animationDelay = (i * 0.6) + 's';
        urbanGrid.appendChild(lineV);

        // Punto de tráfico en la línea
        const dotV = document.createElement('div');
        dotV.className = 'traffic-dot traffic-dot-v';
        dotV.style.left = (5 + i * 10) + '%';
        dotV.style.animationDelay = (i * 0.9) + 's';
        dotV.style.animationDuration = (5 + Math.random() * 5) + 's';
        urbanGrid.appendChild(dotV);
    }
}

// ==========================================
// CARGA DE IMÁGENES DESDE GOOGLE DRIVE
// ==========================================
function initProjectImages() {
    // Cargar imágenes guardadas del localStorage
    const savedImages = JSON.parse(localStorage.getItem('projectImages') || '{}');
    
    document.querySelectorAll('.project-card').forEach(function(card, index) {
        const input = card.querySelector('.gdrive-url');
        const btn = card.querySelector('.load-image-btn');
        const imgElement = card.querySelector('.project-image');
        
        // Cargar imagen guardada si existe
        if (savedImages[index] && imgElement) {
            imgElement.src = savedImages[index];
            imgElement.style.display = 'block';
            const placeholder = card.querySelector('.project-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        }
        
        if (btn && input) {
            btn.addEventListener('click', function() {
                const url = input.value.trim();
                if (url) {
                    const imageUrl = convertGoogleDriveUrl(url);
                    if (imgElement) {
                        imgElement.src = imageUrl;
                        imgElement.style.display = 'block';
                        imgElement.onerror = function() {
                            alert('Error al cargar la imagen. Verifica que el enlace sea público.');
                            imgElement.style.display = 'none';
                        };
                        imgElement.onload = function() {
                            // Guardar en localStorage
                            savedImages[index] = imageUrl;
                            localStorage.setItem('projectImages', JSON.stringify(savedImages));
                            const placeholder = card.querySelector('.project-placeholder');
                            if (placeholder) placeholder.style.display = 'none';
                        };
                    }
                }
            });
            
            // También cargar con Enter
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    btn.click();
                }
            });
        }
    });
}

// Convertir URL de Google Drive a URL directa de imagen
function convertGoogleDriveUrl(url) {
    // Formato: https://drive.google.com/file/d/FILE_ID/view
    // o: https://drive.google.com/open?id=FILE_ID
    
    let fileId = '';
    
    if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
    } else if (url.includes('id=')) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
    } else if (url.includes('uc?')) {
        // Ya es una URL directa
        return url;
    } else {
        // Asumir que es el ID directamente
        fileId = url;
    }
    
    if (fileId) {
        return 'https://drive.google.com/uc?export=view&id=' + fileId;
    }
    
    return url;
}

// ==========================================
// GLOBO 3D CON THREE.JS
// ==========================================
function initGlobe() {
    const container = document.getElementById('globe-container');
    if (!container) {
        console.log('Globe container not found');
        return;
    }

    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Esfera principal (Tierra)
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a4d6e,
        emissive: 0x0a1520,
        specular: 0x333333,
        shininess: 15,
        transparent: true,
        opacity: 0.95
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Grid de latitud/longitud
    const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0xd4a84b, 
        transparent: true, 
        opacity: 0.25
    });

    // Crear líneas de latitud
    for (let lat = -80; lat <= 80; lat += 20) {
        const points = [];
        const phi = (90 - lat) * Math.PI / 180;
        
        for (let lon = 0; lon <= 360; lon += 5) {
            const theta = lon * Math.PI / 180;
            const x = 5.02 * Math.sin(phi) * Math.cos(theta);
            const y = 5.02 * Math.cos(phi);
            const z = 5.02 * Math.sin(phi) * Math.sin(theta);
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        earth.add(line);
    }

    // Crear líneas de longitud
    for (let lon = 0; lon < 360; lon += 30) {
        const points = [];
        const theta = lon * Math.PI / 180;
        
        for (let lat = -90; lat <= 90; lat += 5) {
            const phi = (90 - lat) * Math.PI / 180;
            const x = 5.02 * Math.sin(phi) * Math.cos(theta);
            const y = 5.02 * Math.cos(phi);
            const z = 5.02 * Math.sin(phi) * Math.sin(theta);
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        earth.add(line);
    }

    // Contorno de Sudamérica
    const continentMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4ade80, 
        transparent: true,
        opacity: 0.6
    });

    const southAmericaCoords = [
        [-80, 10], [-75, 5], [-70, 5], [-60, 5], [-50, 0],
        [-45, -5], [-40, -10], [-45, -20], [-50, -25], [-55, -30],
        [-60, -35], [-65, -40], [-70, -45], [-75, -50], [-70, -55],
        [-68, -55], [-70, -50], [-70, -40], [-72, -35], [-70, -30],
        [-70, -20], [-75, -15], [-80, -5], [-80, 0], [-80, 10]
    ];

    const saPoints = [];
    southAmericaCoords.forEach(function(coord) {
        const lon = coord[0];
        const lat = coord[1];
        const phi = (90 - lat) * Math.PI / 180;
        const theta = -(lon + 180) * Math.PI / 180;
        const x = 5.05 * Math.sin(phi) * Math.cos(theta);
        const y = 5.05 * Math.cos(phi);
        const z = 5.05 * Math.sin(phi) * Math.sin(theta);
        saPoints.push(new THREE.Vector3(x, y, z));
    });
    
    const saGeometry = new THREE.BufferGeometry().setFromPoints(saPoints);
    const saLine = new THREE.Line(saGeometry, continentMaterial);
    earth.add(saLine);

    // Marcador de Bolivia (El Alto: -16.5, -68.15)
    const boliviaLat = -16.5;
    const boliviaLon = -68.15;

    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = -(lon + 180) * Math.PI / 180;
        return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // Marcador principal
    const markerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe07850 });
    const boliviaMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    const markerPos = latLonToVector3(boliviaLat, boliviaLon, 5.1);
    boliviaMarker.position.copy(markerPos);
    earth.add(boliviaMarker);

    // Anillos pulsantes
    const ringGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
    const ring1Material = new THREE.MeshBasicMaterial({ 
        color: 0xe07850, 
        transparent: true, 
        opacity: 0.8,
        side: THREE.DoubleSide 
    });
    const ring2Material = new THREE.MeshBasicMaterial({ 
        color: 0xe07850, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide 
    });
    
    const pulseRing1 = new THREE.Mesh(ringGeometry.clone(), ring1Material);
    const pulseRing2 = new THREE.Mesh(ringGeometry.clone(), ring2Material);
    
    pulseRing1.position.copy(markerPos);
    pulseRing2.position.copy(markerPos);
    
    pulseRing1.lookAt(0, 0, 0);
    pulseRing2.lookAt(0, 0, 0);
    
    earth.add(pulseRing1);
    earth.add(pulseRing2);

    // Atmósfera
    const atmosphereGeometry = new THREE.SphereGeometry(5.3, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xd4a84b, 0.3);
    pointLight.position.set(-10, 5, 10);
    scene.add(pointLight);

    camera.position.z = 14;

    // Variables de animación
    let pulseScale1 = 1;
    let pulseScale2 = 1.5;

    // Loop de animación
    function animate() {
        requestAnimationFrame(animate);

        // Rotación continua
        earth.rotation.y += 0.003;

        // Anillos pulsantes
        pulseScale1 += 0.015;
        pulseScale2 += 0.015;
        
        if (pulseScale1 > 2.5) pulseScale1 = 1;
        if (pulseScale2 > 2.5) pulseScale2 = 1;

        pulseRing1.scale.set(pulseScale1, pulseScale1, 1);
        ring1Material.opacity = 0.8 * (1 - (pulseScale1 - 1) / 1.5);

        pulseRing2.scale.set(pulseScale2, pulseScale2, 1);
        ring2Material.opacity = 0.6 * (1 - (pulseScale2 - 1) / 1.5);

        renderer.render(scene, camera);
    }

    animate();

    // Manejar resize
    window.addEventListener('resize', function() {
        if (container.offsetWidth === 0) return;
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
}

// ==========================================
// MAPA INTERACTIVO DE BOLIVIA CON LEAFLET
// ==========================================
function initBoliviaMap() {
    const mapContainer = document.getElementById('bolivia-map');
    if (!mapContainer) {
        console.log('Map container not found');
        return;
    }

    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return;
    }

    // Crear mapa centrado en Bolivia
    const map = L.map('bolivia-map', {
        center: [-16.5, -65],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
    });

    // Estilo oscuro del mapa
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Datos de proyectos
    const projects = [
        {
            name: "El Alto",
            coords: [-16.5, -68.15],
            type: "BASE DE OPERACIONES",
            description: "Ciudad base y residencia. Coordinación de proyectos regionales.",
            isHome: true
        },
        {
            name: "Oruro",
            coords: [-17.9647, -67.1061],
            type: "CATASTRO MINERO",
            description: "Levantamiento catastral y delimitación de concesiones mineras."
        },
        {
            name: "Ixiamas",
            coords: [-13.75, -68.13],
            type: "CONSERVACIÓN AMAZÓNICA",
            description: "Mapeo de cobertura boscosa y monitoreo de deforestación."
        },
        {
            name: "Yungas de La Paz",
            coords: [-16.3, -67.8],
            type: "GESTIÓN DE RIESGOS",
            description: "Análisis de susceptibilidad a deslizamientos."
        },
        {
            name: "Potosí",
            coords: [-19.5836, -65.7531],
            type: "PATRIMONIO TERRITORIAL",
            description: "Cartografía histórica y delimitación de áreas patrimoniales."
        }
    ];

    // Crear marcadores personalizados
    projects.forEach(function(project) {
        const size = project.isHome ? 16 : 12;
        const color = project.isHome ? '#d4a84b' : '#e07850';
        
        const icon = L.divIcon({
            className: 'custom-marker-icon',
            html: '<div style="' +
                'width: ' + size + 'px;' +
                'height: ' + size + 'px;' +
                'background: ' + color + ';' +
                'border: 3px solid white;' +
                'border-radius: 50%;' +
                'box-shadow: 0 0 15px ' + color + ';' +
                '"></div>',
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });

        const marker = L.marker(project.coords, { icon: icon }).addTo(map);

        // Popup
        const popupContent = 
            '<div style="font-family: Space Grotesk, sans-serif; min-width: 180px;">' +
                '<div style="font-family: DM Mono, monospace; font-size: 0.7rem; color: #e07850; letter-spacing: 1px; margin-bottom: 5px;">' + 
                    project.type + 
                '</div>' +
                '<div style="font-family: Playfair Display, serif; font-size: 1.1rem; margin-bottom: 8px; color: #f5f0e6;">' + 
                    project.name + 
                '</div>' +
                '<div style="font-size: 0.85rem; opacity: 0.8; line-height: 1.5; color: #f5f0e6;">' + 
                    project.description + 
                '</div>' +
                '<div style="font-family: DM Mono, monospace; font-size: 0.65rem; margin-top: 8px; color: #d4a84b;">' + 
                    project.coords[0].toFixed(4) + '°, ' + project.coords[1].toFixed(4) + '°' +
                '</div>' +
            '</div>';

        marker.bindPopup(popupContent);
    });

    // Líneas conectoras desde El Alto
    const elAltoCoords = projects[0].coords;
    projects.slice(1).forEach(function(project) {
        L.polyline([elAltoCoords, project.coords], {
            color: '#d4a84b',
            weight: 1,
            opacity: 0.3,
            dashArray: '5, 10'
        }).addTo(map);
    });

    // Interactividad con la lista lateral
    const locationItems = document.querySelectorAll('.project-locations-list li');
    locationItems.forEach(function(item, index) {
        item.addEventListener('click', function() {
            const project = projects[index];
            if (project) {
                map.flyTo(project.coords, 10, { duration: 1.5 });
            }
        });
    });
}

// ==========================================
// ANIMACIONES DE SCROLL
// ==========================================
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    function checkReveal() {
        const windowHeight = window.innerHeight;
        
        reveals.forEach(function(el) {
            const revealTop = el.getBoundingClientRect().top;
            const revealPoint = 150;
            
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    checkReveal();
}

// ==========================================
// COORDENADAS ANIMADAS
// ==========================================
function initAnimatedCoords() {
    const latEl = document.getElementById('lat');
    const longEl = document.getElementById('long');
    
    if (!latEl || !longEl) return;

    // El Alto: -16.5, -68.15
    setInterval(function() {
        const latVar = (Math.random() - 0.5) * 0.0002;
        const lonVar = (Math.random() - 0.5) * 0.0002;
        
        latEl.textContent = (-16.5000 + latVar).toFixed(4) + '°';
        longEl.textContent = (-68.1500 + lonVar).toFixed(4) + '°';
    }, 100);
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
