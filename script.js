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
        [-65.80960, -9.76523],
    [-65.87558, -9.79406],
    [-65.91818, -9.76567],
    [-65.94920, -9.76533],
    [-65.97259, -9.80564],
    [-66.00584, -9.79833],
    [-66.08621, -9.79413],
    [-66.12291, -9.79215],
    [-66.19273, -9.81833],
    [-66.26911, -9.83563],
    [-66.34711, -9.83823],
    [-66.42495, -9.87325],
    [-66.51844, -9.87899],
    [-66.57883, -9.89099],
    [-66.62811, -9.93596],
    [-66.63439, -9.92860],
    [-66.69471, -9.97295],
    [-66.76401, -10.00195],
    [-66.83835, -10.06981],
    [-66.88659, -10.10352],
    [-66.98235, -10.18998],
    [-67.02169, -10.25483],
    [-67.15727, -10.32820],
    [-67.21067, -10.32151],
    [-67.25249, -10.32765],
    [-67.27045, -10.32751],
    [-67.29123, -10.32057],
    [-67.31121, -10.32145],
    [-67.31799, -10.32040],
    [-67.31610, -10.37871],
    [-67.32005, -10.38250],
    [-67.32532, -10.38341],
    [-67.34293, -10.37912],
    [-67.35241, -10.39517],
    [-67.36070, -10.38802],
    [-67.38107, -10.38479],
    [-67.40021, -10.37520],
    [-67.41667, -10.38778],
    [-67.41317, -10.42645],
    [-67.42209, -10.43040],
    [-67.43424, -10.44027],
    [-67.45123, -10.46234],
    [-67.47796, -10.46529],
    [-67.50806, -10.47663],
    [-67.55782, -10.49599],
    [-67.59428, -10.52325],
    [-67.61776, -10.57077],
    [-67.63977, -10.59694],
    [-67.68495, -10.63188],
    [-67.71341, -10.70811],
    [-67.72846, -10.71172],
    [-67.74533, -10.69545],
    [-67.75781, -10.68833],
    [-67.77007, -10.68632],
    [-67.77929, -10.68158],
    [-67.78874, -10.67351],
    [-67.79844, -10.66869],
    [-67.80928, -10.66610],
    [-67.82395, -10.65092],
    [-67.83843, -10.64891],
    [-67.85881, -10.64633],
    [-67.87792, -10.64082],
    [-67.89566, -10.64578],
    [-67.91147, -10.64389],
    [-67.92534, -10.65091],
    [-67.97332, -10.65801],
    [-67.99137, -10.65322],
    [-68.00949, -10.64973],
    [-68.02425, -10.65444],
    [-68.03342, -10.65779],
    [-68.05510, -10.67058],
    [-68.06434, -10.67840],
    [-68.06960, -10.68536],
    [-68.07918, -10.69239],
    [-68.08897, -10.70147],
    [-68.09569, -10.70652],
    [-68.10039, -10.71139],
    [-68.10598, -10.72154],
    [-68.10394, -10.74522],
    [-68.10298, -10.75713],
    [-68.10663, -10.76895],
    [-68.10756, -10.77983],
    [-68.12580, -10.79431],
    [-68.13211, -10.80197],
    [-68.13929, -10.81019],
    [-68.14628, -10.81810],
    [-68.15460, -10.82458],
    [-68.16512, -10.83511],
    [-68.17512, -10.84532],
    [-68.19385, -10.85938],
    [-68.20144, -10.87790],
    [-68.20665, -10.89896],
    [-68.21913, -10.90858],
    [-68.22756, -10.92276],
    [-68.23102, -10.94718],
    [-68.24198, -10.96207],
    [-68.26928, -10.97860],
    [-68.29132, -10.99087],
    [-68.32500, -11.00818],
    [-68.34245, -11.00877],
    [-68.37165, -11.01421],
    [-68.38818, -11.02511],
    [-68.40342, -11.05626],
    [-68.42335, -11.04484],
    [-68.43760, -11.04166],
    [-68.45837, -11.05215],
    [-68.49195, -11.05730],
    [-68.53858, -11.09675],
    [-68.72205, -11.10676],
    [-68.76537, -11.06789],
    [-68.76291, -11.04885],
    [-68.75267, -11.04035],
    [-68.75060, -11.01766],
    [-68.74752, -11.01255],
    [-68.75968, -11.01275],
    [-68.75718, -11.00266],
    [-68.77846, -11.00395],
    [-68.79000, -11.01039],
    [-68.81212, -10.99897],
    [-68.82713, -11.00341],
    [-68.85585, -11.00586],
    [-68.88279, -11.01888],
    [-68.89616, -11.01027],
    [-68.92797, -11.01578],
    [-68.94019, -11.01267],
    [-68.96100, -10.99501],
    [-68.98296, -11.00010],
    [-69.03877, -10.98152],
    [-69.06622, -10.97679],
    [-69.07400, -10.97762],
    [-69.13806, -10.97352],
    [-69.16548, -10.96293],
    [-69.24417, -10.94132],
    [-69.24899, -10.94526],
    [-69.25692, -10.93956],
    [-69.33784, -10.95136],
    [-69.44901, -10.93799],
    [-69.50000, -10.93477],
    [-69.54482, -10.95187],
    [-69.56582, -10.95786],
    [-68.65792, -12.52159],
    [-68.67231, -12.54146],
    [-68.67906, -12.55482],
    [-68.69339, -12.56522],
    [-68.70170, -12.57965],
    [-68.71682, -12.60531],
    [-68.73961, -12.63634],
    [-68.72954, -12.66189],
    [-68.73519, -12.66360],
    [-68.72542, -12.67334],
    [-68.71191, -12.68084],
    [-68.73240, -12.70139],
    [-68.78354, -12.74476],
    [-68.80020, -12.75619],
    [-68.80666, -12.76824],
    [-68.81798, -12.80509],
    [-68.83471, -12.81394],
    [-68.83786, -12.84911],
    [-68.85898, -12.86295],
    [-68.87052, -12.87196],
    [-68.86757, -12.89172],
    [-68.87366, -12.93906],
    [-68.87570, -12.94555],
    [-68.87908, -12.95492],
    [-68.87252, -12.98042],
    [-68.86943, -13.01105],
    [-68.87462, -13.01488],
    [-68.86655, -13.03083],
    [-68.85334, -13.01527],
    [-68.86189, -13.05550],
    [-68.86561, -13.11136],
    [-68.86412, -13.11146],
    [-68.85989, -13.11174],
    [-68.86837, -13.11764],
    [-68.87723, -13.13860],
    [-68.85740, -13.20029],
    [-68.86279, -13.22486],
    [-68.85642, -13.23616],
    [-68.86086, -13.30427],
    [-68.87126, -13.32376],
    [-68.88514, -13.39459],
    [-68.89222, -13.43669],
    [-68.90324, -13.43576],
    [-68.90619, -13.44423],
    [-68.89982, -13.44625],
    [-68.91184, -13.48099],
    [-68.91649, -13.51782],
    [-68.93346, -13.52701],
    [-68.95352, -13.60495],
    [-68.99878, -13.61809],
    [-68.99489, -13.64460],
    [-69.00266, -13.65362],
    [-69.03251, -13.64374],
    [-69.06273, -13.66866],
    [-69.05533, -13.70186],
    [-69.02812, -13.73458],
    [-69.02035, -13.73805],
    [-69.01499, -13.73782],
    [-68.99071, -13.75257],
    [-68.98670, -13.75426],
    [-68.97971, -13.77111],
    [-68.92064, -13.82069],
    [-68.94354, -13.85598],
    [-68.97235, -13.96664],
    [-68.94660, -14.01152],
    [-68.88820, -14.05433],
    [-68.85059, -14.13503],
    [-68.84673, -14.15332],
    [-68.84070, -14.15340],
    [-68.83070, -14.20672],
    [-69.11249, -14.48613],
    [-69.14739, -14.54448],
    [-69.22210, -14.58496],
    [-69.23023, -14.60069],
    [-69.24262, -14.65937],
    [-69.27637, -14.76685],
    [-69.36130, -14.95232],
    [-69.35512, -14.96858],
    [-69.33559, -14.99242],
    [-69.32480, -15.00858],
    [-69.28914, -15.08167],
    [-69.28265, -15.09747],
    [-69.26916, -15.10854],
    [-69.23635, -15.12254],
    [-69.20309, -15.15080],
    [-69.17992, -15.17562],
    [-69.15544, -15.20810],
    [-69.13252, -15.24382],
    [-69.12191, -15.25276],
    [-69.30884, -15.49801],
    [-69.09489, -16.22443],
    [-68.97604, -16.43610],
    [-69.01099, -16.64034],
    [-69.02452, -16.67509],
    [-69.03652, -16.68217],
    [-69.19087, -16.79395],
    [-69.21630, -16.82736],
    [-69.22959, -16.84020],
    [-69.30664, -16.91727],
    [-69.32094, -16.93918],
    [-69.32427, -16.96493],
    [-69.38217, -17.03591],
    [-69.59262, -17.21009],
    [-69.39961, -17.67007],
    [-69.33616, -17.74136],
    [-69.33375, -17.73949],
    [-69.31705, -17.78536],
    [-69.30586, -17.83978],
    [-69.30040, -17.85227],
    [-69.30360, -17.86493],
    [-69.30709, -17.89237],
    [-69.30932, -17.89787],
    [-69.31064, -17.90410],
    [-69.29763, -17.94271],
    [-69.05169, -18.31176],
    [-69.04715, -18.31257],
    [-69.00657, -18.59885],
    [-68.96648, -18.94659],
    [-68.48403, -19.34244],
    [-68.62721, -19.78486],
    [-68.45189, -20.64864],
    [-68.55345, -20.73247],
    [-68.06307, -21.85279],
    [-67.89079, -22.71776],
    [-67.87691, -22.82077],
    [-67.58535, -22.90559],
    [-66.96797, -22.53545],
    [-66.78515, -22.41721],
    [-66.49502, -22.16530],
    [-66.33995, -22.11696],
    [-66.32792, -22.10752],
    [-66.32236, -22.08730],
    [-66.30692, -22.09442],
    [-66.29288, -22.08947],
    [-66.29088, -22.07753],
    [-66.28418, -22.05004],
    [-66.28714, -22.04359],
    [-66.28938, -22.03134],
    [-66.28053, -22.00417],
    [-66.27577, -21.95125],
    [-66.25879, -21.91530],
    [-66.24809, -21.89526],
    [-66.23710, -21.81343],
    [-66.24171, -21.79144],
    [-65.79047, -22.07997],
    [-65.77132, -22.09557],
    [-65.63865, -22.10658],
    [-65.58488, -22.09111],
    [-65.47450, -22.08888],
    [-65.09316, -22.08435],
    [-64.98338, -22.09484],
    [-64.96647, -22.10384],
    [-64.95435, -22.10491],
    [-64.93714, -22.11248],
    [-64.91675, -22.12146],
    [-64.89511, -22.12349],
    [-64.88027, -22.12084],
    [-64.86210, -22.12204],
    [-64.83680, -22.13932],
    [-64.79385, -22.16320],
    [-64.77540, -22.17664],
    [-64.71751, -22.19418],
    [-64.68920, -22.18858],
    [-64.65825, -22.19586],
    [-64.63443, -22.20151],
    [-64.61556, -22.21319],
    [-64.59966, -22.23629],
    [-64.53936, -22.28236],
    [-64.54676, -22.31122],
    [-64.55693, -22.31846],
    [-64.56530, -22.33074],
    [-64.47891, -22.47121],
    [-64.43212, -22.52196],
    [-64.41797, -22.53517],
    [-64.41054, -22.56349],
    [-64.42214, -22.57900],
    [-64.42738, -22.57797],
    [-64.43508, -22.62389],
    [-64.39505, -22.68616],
    [-64.39738, -22.72081],
    [-64.37878, -22.72071],
    [-64.34401, -22.79589],
    [-64.33827, -22.80629],
    [-64.33511, -22.80608],
    [-64.33313, -22.80722],
    [-64.33058, -22.82111],
    [-64.30775, -22.84116],
    [-64.30367, -22.83560],
    [-64.29606, -22.85502],
    [-64.31149, -22.87671],
    [-64.32127, -22.87419],
    [-64.29065, -22.80971],
    [-64.28520, -22.79551],
    [-64.27536, -22.74438],
    [-64.27176, -22.73628],
    [-64.26621, -22.67896],
    [-64.26046, -22.67053],
    [-64.26899, -22.66133],
    [-64.24454, -22.58074],
    [-64.24233, -22.55943],
    [-64.23190, -22.55897],
    [-64.21596, -22.54415],
    [-64.18681, -22.48055],
    [-64.16742, -22.47027],
    [-64.15233, -22.44604],
    [-64.13994, -22.43197],
    [-64.12131, -22.38417],
    [-64.11531, -22.36174],
    [-64.10301, -22.33063],
    [-64.08325, -22.29306],
    [-64.03354, -22.20282],
    [-64.00754, -22.16266],
    [-63.99727, -22.10552],
    [-63.99022, -22.10338],
    [-63.97939, -22.08573],
    [-63.95798, -22.07085],
    [-63.95117, -22.05904],
    [-63.94342, -22.03287],
    [-63.73015, -22.00375],
    [-63.70178, -22.01589],
    [-63.68822, -22.02095],
    [-63.68196, -22.03185],
    [-63.67116, -22.02444],
    [-63.68480, -22.04542],
    [-62.80567, -22.15008],
    [-62.80172, -22.13811],
    [-62.79267, -22.15943],
    [-62.76660, -22.16690],
    [-62.73828, -22.16849],
    [-60.75868, -19.48075],
    [-60.67014, -19.46626],
    [-58.44773, -19.67577],
    [-58.16341, -20.06728],
    [-58.14338, -20.13637],
    [-58.10273, -20.12268],
    [-58.04036, -20.08641],
    [-57.96870, -20.03953],
    [-57.71023, -18.97994],
    [-57.75262, -18.85610],
    [-57.45443, -18.23102],
    [-57.56384, -18.13751],
    [-57.59256, -18.07446],
    [-57.66897, -17.92492],
    [-57.71900, -17.83740],
    [-57.75394, -17.68314],
    [-57.78111, -17.61590],
    [-57.97413, -17.50652],
    [-58.01591, -17.49965],
    [-58.04508, -17.48345],
    [-58.07019, -17.45113],
    [-58.10609, -17.45419],
    [-58.18963, -17.39216],
    [-58.24744, -17.35478],
    [-58.26412, -17.33821],
    [-58.36835, -17.20044],
    [-58.39689, -17.18666],
    [-58.42684, -17.00238],
    [-58.44141, -16.98669],
    [-58.46787, -16.88269],
    [-58.46679, -16.84679],
    [-58.46373, -16.84342],
    [-58.47776, -16.82515],
    [-58.46576, -16.76104],
    [-58.34286, -16.46231],
    [-58.35409, -16.43367],
    [-58.55586, -16.31750],
    [-58.82987, -16.30641],
    [-59.11982, -16.29594],
    [-59.25293, -16.28923],
    [-59.37585, -16.28382],
    [-59.56107, -16.27846],
    [-59.70469, -16.27601],
    [-59.87241, -16.27291],
    [-60.21668, -15.66745],
    [-60.26991, -14.66325],
    [-60.32913, -14.56472],
    [-60.34450, -14.50686],
    [-60.39894, -14.41337],
    [-60.44347, -13.92102],
    [-60.46633, -13.79779],
    [-60.48258, -13.79642],
    [-60.51759, -13.79610],
    [-60.54753, -13.77487],
    [-60.57886, -13.74699],
    [-60.61967, -13.71832],
    [-60.67041, -13.72303],
    [-60.70545, -13.69510],
    [-60.76954, -13.66619],
    [-60.81717, -13.63577],
    [-60.88144, -13.61427],
    [-60.96679, -13.53610],
    [-60.99900, -13.53111],
    [-61.04980, -13.47923],
    [-61.08945, -13.49347],
    [-61.13254, -13.52422],
    [-61.16077, -13.51522],
    [-61.19501, -13.53581],
    [-61.25052, -13.49691],
    [-61.31327, -13.50328],
    [-61.38326, -13.51950],
    [-61.45251, -13.54846],
    [-61.55865, -13.51871],
    [-61.73065, -13.51630],
    [-61.89327, -13.49230],
    [-62.01177, -13.35886],
    [-62.10958, -13.22355],
    [-62.19938, -13.13317],
    [-62.29343, -13.14590],
    [-62.43096, -13.10564],
    [-62.55019, -13.07073],
    [-62.64681, -12.96653],
    [-62.78804, -13.00128],
    [-62.87562, -12.90043],
    [-62.97913, -12.85834],
    [-63.02020, -12.79554],
    [-63.13706, -12.64184],
    [-63.19125, -12.62305],
    [-63.36151, -12.65856],
    [-63.50721, -12.56322],
    [-63.60904, -12.48709],
    [-63.68408, -12.45345],
    [-63.77093, -12.43912],
    [-63.82625, -12.45976],
    [-63.89922, -12.48082],
    [-64.08889, -12.49081],
    [-64.17419, -12.50040],
    [-64.22025, -12.46099],
    [-64.30854, -12.45751],
    [-64.46049, -12.38852],
    [-64.61528, -12.21460],
    [-64.70346, -12.10792],
    [-64.75694, -12.15701],
    [-64.81588, -12.10477],
    [-64.96930, -12.01309],
    [-65.02948, -11.94589],
    [-65.04374, -11.88569],
    [-65.06448, -11.87772],
    [-65.07167, -11.85927],
    [-65.25747, -11.69921],
    [-65.23085, -11.58459],
    [-65.22514, -11.56312],
    [-65.21528, -11.55410],
    [-65.24620, -11.51456],
    [-65.32062, -11.43486],
    [-65.32772, -11.38243],
    [-65.31556, -11.31427],
    [-65.35832, -11.25271],
    [-65.33699, -11.18607],
    [-65.35242, -11.17675],
    [-65.28679, -11.05061],
    [-65.34893, -10.74653],
    [-65.41033, -10.51060],
    [-65.42741, -10.49604],
    [-65.39581, -10.45843],
    [-65.38084, -10.42518],
    [-65.30800, -10.16449],
    [-65.29158, -9.84045],
    [-65.50393, -9.76003],
    [-65.59837, -9.84384],
    [-65.70985, -9.76751],
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
