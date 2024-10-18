const svg = document.getElementById('wavy-line-svg');
    const numLines = 6;
    const numDots = 7;
    const amplitude = 50;
    const frequency = 2;
    const segments = 100;
    const duration = 15000; // Duration in milliseconds (15 seconds)

    function createWavyLine(lineIndex) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('class', 'line');
      svg.appendChild(line);

      // Create dots for each line
      const dots = [];
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('class', 'dot');
        dot.setAttribute('r', 3);
        svg.appendChild(dot);
        dots.push(dot);
      }

      function updateWave(time) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const x = 100 + t * 800;  // X-axis (linear interpolation from 100 to 900)
          const y = 300 + Math.sin(t * frequency * Math.PI * 2 + time + lineIndex) * amplitude;
          points.push(`${x},${y}`);
        }
        line.setAttribute('d', `M${points.join(' L')}`);

        // Update dots
        for (let i = 0; i < dots.length; i++) {
          const t = (i + 1) / (numDots + 1);
          const x = 100 + t * 800;
          const y = 300 + Math.sin(t * frequency * Math.PI * 2 + time + lineIndex) * amplitude;
          dots[i].setAttribute('cx', x);
          dots[i].setAttribute('cy', y);
        }
      }

      return updateWave;
    }

    const updateFunctions = [];
    for (let i = 0; i < numLines; i++) {
      const updateWave = createWavyLine(i);
      updateFunctions.push(updateWave);
    }

    function animateWave(time) {
      const normalizedTime = (time % duration) / duration * Math.PI * 2;
      updateFunctions.forEach(update => update(normalizedTime));
      requestAnimationFrame(animateWave);
    }

    requestAnimationFrame(animateWave);