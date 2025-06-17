document.getElementById('measurementForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the form values
    const rowsPerInch = +document.getElementById('rowsPerInch').value;
    const columnsPerInch = +document.getElementById('columnsPerInch').value;
    const waist = +document.getElementById('waist').value;
    const chest = +document.getElementById('chest').value;
    const shoulder = +document.getElementById('shoulder').value;
    const neck = +document.getElementById('neck').value;
    const collar = +document.getElementById('collar').value;
    const garmentLength = +document.getElementById('garmentLength').value;
    const hemHeight = +document.getElementById('hemHeight').value;
    const toPit = +document.getElementById('toPit').value;
    const drop = +document.getElementById('drop').value;
    const sleeveLen = +document.getElementById('sleeveLen').value;
    const cuffWidth = +document.getElementById('cuffWidth').value;
    const cuffHem = +document.getElementById('cuffHem').value;

    const colorRadio = document.querySelector('input[name="color"]:checked');
    let selectedColor = colorRadio ? colorRadio.value : null;
    console.log('Selected color:', selectedColor);
        
    // with the middle bottom of the garment as the origin
    sweater = {
        bodyPolygonInches: [
            [-waist/2, 0],
            [waist/2, 0],
            [waist/2, hemHeight],
            [chest/2, toPit],
            [shoulder/2, garmentLength-drop],
            [neck/2, garmentLength],
            [-neck/2, garmentLength],
            [-shoulder/2, garmentLength-drop],
            [-chest/2, toPit],
            [-waist/2, hemHeight],
        ],
        sleevePolygonInches: [
            [shoulder/2, garmentLength - drop],
            // 30/60/90 triange = 30 degrees
            [shoulder/2 + Math.sqrt(3) * sleeveLen/2, garmentLength - drop -  sleeveLen/2],
            [shoulder/2 + Math.sqrt(3) * sleeveLen/2 - cuffWidth/2, garmentLength - drop -  sleeveLen/2 - cuffWidth/2*Math.sqrt(3)],
            [shoulder/2 + Math.sqrt(3) * sleeveLen/2 - cuffWidth/2 - cuffHem/2*Math.sqrt(3), garmentLength - drop -  sleeveLen/2 - cuffWidth/2*Math.sqrt(3) + cuffHem/2],
            // [neck/2 + sleeveLen, garmentLength-cuffWidth],
            [chest/2, toPit]
        ],
        stitchGrid: {},
        // createStitchGrid : function() {

        //     return this.firstName + " " + this.lastName;
        //   }

    }

    // Clear any existing visualization
    const svg = d3.select("svg");
    svg.selectAll("*").remove();

    // Create a basic sweater pattern
    const width = svg.attr("width");
    const height = svg.attr("height");

    const midpoint = width/2;

    const buffer = 100;

    const xScale = d3.scaleLinear()
        .domain([-(chest/2 ),chest/2 ])
        .range([buffer, width - buffer]);

    const oneInch = (xScale(1)-width/2);

    const yScale = d3.scaleLinear()
        .domain([0,garmentLength])
        .range([height/2+garmentLength/2*oneInch,height/2-garmentLength/2*oneInch])
    
        // calculate the midpoints of all the stitches
    for (let row = 0; row < Math.round(garmentLength*rowsPerInch-1); row++) {
        sweater.stitchGrid[row] = {}
    for (let col = 0; col < Math.round(chest/2*columnsPerInch); col++) {
            if (d3.polygonContains(sweater.bodyPolygonInches, [col/columnsPerInch,row/rowsPerInch+1/(2*rowsPerInch)])){
            sweater.stitchGrid[row][col] = {
                position:[col/columnsPerInch,row/rowsPerInch+1/(2*rowsPerInch)],
                color:1};
            sweater.stitchGrid[row][-col] = {
                position:[-col/columnsPerInch,row/rowsPerInch+1/(2*rowsPerInch)],
                color:1};
    }}};

    svg.append('line')
    .attr('x1', xScale(0))
    .attr('y1', 0)
    .attr('x2', xScale(0))
    .attr('y2', height)
    .attr("stroke", "black")
    .attr("stroke-width", 2);
    ;

    for (const row in sweater.stitchGrid) {
        for (const col in sweater.stitchGrid[row]) {
            svg.append("rect")
            .attr("x", xScale(sweater.stitchGrid[row][col]['position'][0] - 1/(2*columnsPerInch)))
            .attr("y", yScale(sweater.stitchGrid[row][col]['position'][1] + 1/(2*columnsPerInch)))
            .attr("width", oneInch/columnsPerInch)
            .attr("height", oneInch/rowsPerInch)
            .attr("stroke", "black")
            .attr('data-row', row) // Set the row attribute
            .attr('data-col', col) // Set the col attribute
            .attr('fill', 'blue').on("mouseover", function (event, d) {
                // Bring this rectangle to the front
                d3.select(this).raise();
        
                // Make the rectangle grow slightly
                d3.select(this)
                    .transition()
                    .duration(200) // Animation duration in milliseconds
                    .attr("x", d3.select(this).attr("x") - 1) // Move left to keep centered
                    .attr("y", d3.select(this).attr("y") - 1) // Move up to keep centered
                    .attr("width", parseFloat(d3.select(this).attr("width")) + 2)
                    .attr("height", parseFloat(d3.select(this).attr("height")) + 2)
                    // .attr("fill", "lightblue"); // Optional: change color
                    .attr("stroke", "white")
            })
            .on("mouseout", function (event, d) {
                // Restore the rectangle to its original size
                d3.select(this)
                    .transition()
                    .duration(200) // Animation duration in milliseconds
                    .attr("x", xScale(sweater.stitchGrid[row][col]['position'][0] - 1 / (2 * columnsPerInch)))
                    .attr("y", yScale(sweater.stitchGrid[row][col]['position'][1] + 1 / (2 * columnsPerInch)))
                    .attr("width", oneInch / columnsPerInch)
                    .attr("height", oneInch / rowsPerInch)
                    .attr("stroke", "black")
                    // .attr("fill", "blue"); // Restore original color
            }).on("click", function (event, d) {
                // Get the selected color from the radio buttons
                const selectedColor = document.querySelector('input[name="color"]:checked');
                if (!selectedColor) {
                    console.error("No color selected!");
                    return;
                }
                console.log("Clicked color:", selectedColor.value);

                // Change the fill of the clicked rectangle
                const rect = d3.select(this);
                rect.attr("fill", selectedColor.value);

                const row = rect.attr("data-row");
                const col = rect.attr("data-col");
                console.log("row:", row);
                console.log("col:", col);

                sweater.stitchGrid[row][col] = selectedColor.value;

                // After selecting a color, return the rectangle to its normal size
                rect.transition()
                    .duration(200)
                    .attr("x", xScale(sweater.stitchGrid[row][col]['position'][0] - 1 / (2 * columnsPerInch)))
                    .attr("y", yScale(sweater.stitchGrid[row][col]['position'][1] + 1 / (2 * columnsPerInch)))
                    .attr("width", oneInch / columnsPerInch)
                    .attr("height", oneInch / rowsPerInch)
                    .attr("stroke", "black");

            });
          }
        }
 
});