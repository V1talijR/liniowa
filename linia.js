    let currentA = 0;
    let currentB = 0;

    function draw() {
    let raw = document.getElementById("equation").value;
    let infoEl = document.getElementById("info");
    infoEl.innerHTML = "";

    if (!raw || !raw.trim()) { alert("Wpisz równanie!"); return; }

    const eq = raw.replace(/\s+/g, "");
    if (!isNaN(eq)) { 
        currentA = 0;
        currentB = parseFloat(eq);
    } else {
        const linearRegex = /^([+-]?(\d+(\.\d+)?|\.\d+)?)?\*?x([+-](\d+(\.\d+)?|\.\d+))?$/i;
        const match = eq.match(linearRegex);
        if (!match) { alert("Dozwolone są tylko funkcje liniowe (ax+b) lub liczby stałe."); return; }
        let aStr = match[1]; let bStr = match[4];
        if (!aStr || aStr === "+") aStr="1"; if(aStr === "-") aStr="-1"; if(!bStr) bStr="0";
        currentA=parseFloat(aStr); currentB=parseFloat(bStr);
    }

    functionPlot({
        target:'#plot', width:700, height:400, grid:true,
        data:[{ fn:`${currentA}*x${currentB>=0?"+"+currentB:currentB}` }]
    });

    infoEl.innerHTML = `\\(${currentA}x - y + (${currentB}) = 0\\)`;
    MathJax.typesetPromise();
    }

    function addPoint() {
    let px = parseFloat(document.getElementById("px").value);
    let py = parseFloat(document.getElementById("py").value);

    if (isNaN(px) || isNaN(py)) {
        alert("Wprowadź poprawne współrzędne punktu!");
        return;
    }

    const A = currentA;
    const B = -1;
    const C = currentB;

    const numerator = Math.abs(A*px + B*py + C);
    const denomSquared = A*A + B*B;
    const sqrtDenominator = Math.sqrt(denomSquared);

    let distanceStr;
    if (numerator === 0) {
        distanceStr = "0";
    } else if (Number.isInteger(sqrtDenominator)) {
        const distance = numerator / sqrtDenominator;
        distanceStr = distance.toFixed(3);
    } else {
        distanceStr = `\\frac{${numerator} \\cdot \\sqrt{${denomSquared}}}{${denomSquared}}`;
    }

    const xClosest = (B*(B*px - A*py) - A*C)/(A*A + B*B);
    const yClosest = (-A*xClosest - C)/B;

    let steps = `<b>Kroki obliczeń odległości punktu od prostej:</b><br>`;
    steps += `1. Punkt P: \\((${px}, ${py})\\)<br>`;
    steps += `2. Równanie prostej (postać ogólna): \\(${A}x + (${B})y + (${C}) = 0\\)<br>`;
    steps += `3. Licznik: \\(|Ax_0 + By_0 + C| = |${A}*${px} + (${B})*${py} + ${C}| = ${numerator.toFixed(3)}\\)<br>`;
    steps += `4. Mianownik: \\(\\sqrt{A^2 + B^2} = \\sqrt{${A*A} + ${B*B}} ${Number.isInteger(sqrtDenominator) ? "= " + sqrtDenominator : ""}\\)<br>`;
    steps += `5. Odległość: \\(d = ${distanceStr}\\)<br>`;
    steps += `6. Punkt na prostej najbliższy do P: \\((${xClosest.toFixed(3)}, ${yClosest.toFixed(3)})\\)`;

    const plotData = [
        { fn: `${currentA}*x${currentB>=0?"+"+currentB:currentB}`, graphType:'polyline' },
        { points:[[px,py]], fnType:'points', graphType:'scatter', color:'red', fnLabel:'Punkt P' },
        { points:[[px,py],[xClosest,yClosest]], fnType:'points', graphType:'polyline', color:'blue', fnLabel:'Odcinek' }
    ];

    functionPlot({ target:'#plot', width:700, height:400, grid:true, data:plotData });
    document.getElementById("info").innerHTML = steps;
    MathJax.typesetPromise();
    }