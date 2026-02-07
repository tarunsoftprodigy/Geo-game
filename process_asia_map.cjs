const fs = require('fs');

function decodeTopoArcs(arcs, transform) {
    const scale = transform.scale;
    const translate = transform.translate;
    return arcs.map(arc => {
        let x = 0, y = 0;
        return arc.map(([dx, dy]) => {
            x += dx;
            y += dy;
            return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
        });
    });
}

function getPathAndBounds(geometry, decodedArcs) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    const processPolygon = (polygonArcs) => {
        const pathSegments = [];
        polygonArcs.forEach(arcIndex => {
            let reverse = false;
            if (arcIndex < 0) {
                arcIndex = ~arcIndex;
                reverse = true;
            }
            let arc = decodedArcs[arcIndex];
            if (reverse) arc = [...arc].reverse();
            if (pathSegments.length === 0) {
                pathSegments.push(...arc);
            } else {
                pathSegments.push(...arc.slice(1));
            }
        });
        
        if (pathSegments.length === 0) return "";
        
        return "M" + pathSegments.map(p => {
            const x = p[0];
            const y = -p[1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        }).join("L") + "Z";
    };

    let path = "";
    if (geometry.type === 'Polygon') {
        path = processPolygon(geometry.arcs[0]);
    } else if (geometry.type === 'MultiPolygon') {
        path = geometry.arcs.map(multiArcs => processPolygon(multiArcs[0])).join(" ");
    }

    return {
        path,
        bounds: minX === Infinity ? null : {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        }
    };
}

function main() {
    if (!fs.existsSync('countries-110m.json')) {
        console.error("Error: countries-110m.json not found!");
        return;
    }
    const topo = JSON.parse(fs.readFileSync('countries-110m.json', 'utf8'));
    const transform = topo.transform;
    const decodedArcs = decodeTopoArcs(topo.arcs, transform);
    
    // Top 10 Asian countries for the game
    const targetCountries = [
        "China", "India", "Japan", "South Korea", "Indonesia", 
        "Thailand", "Vietnam", "Philippines", "Malaysia", "Bangladesh"
    ];
    
    const results = {};
    const baseMap = [];
    
    topo.objects.countries.geometries.forEach(country => {
        const name = country.properties.name;
        const { path, bounds } = getPathAndBounds(country, decodedArcs);
        if (!path) return;

        if (targetCountries.includes(name)) {
            results[name] = { path, bounds };
            baseMap.push({ name, path, interactive: true });
        } else {
            // Add other Asian countries as background
            const otherAsia = [
                "Myanmar", "Cambodia", "Laos", "Singapore", "Brunei",
                "Pakistan", "Afghanistan", "Nepal", "Bhutan", "Sri Lanka",
                "Mongolia", "North Korea", "Taiwan", "Timor-Leste"
            ];
            if (otherAsia.includes(name)) {
                baseMap.push({ name, path, interactive: false });
            }
        }
    });

    if (!fs.existsSync('src')) fs.mkdirSync('src');
    fs.writeFileSync('src/asia_map_data.json', JSON.stringify({ countries: results, base_map: baseMap }, null, 2));
    console.log("Success! Created asia_map_data.json with paths and bounds.");
    console.log(`Generated ${Object.keys(results).length} interactive countries.`);
}

main();
