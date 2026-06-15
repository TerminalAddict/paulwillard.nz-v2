// Paul Willard Website Interactivity & Animation Engine

document.addEventListener('DOMContentLoaded', () => {
  initTerminal();
  initHobbiesSelector();
  initTestimonialsSlider();
  initBeardTilt();
  initOrbitMenu();
  initOrbitMenuHint();
  initMailLinks();
  initGstCalculator();
  initImageModal();
  initScrollAnimations();

  const initCanvasWork = () => {
    initBackgroundCanvas();
    initNetworkCanvas();
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initCanvasWork, { timeout: 1200 });
  } else {
    setTimeout(initCanvasWork, 0);
  }
});

/* ==========================================================================
   1. Interactive Background Canvas (Subtle Network Field)
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const codeMarks = ['ssh', 'sudo', 'eth0', 'vlan', 'apt', 'tcp', 'kvm', 'bash'];
  let width = 0;
  let height = 0;
  let nodes = [];
  let links = [];
  let pulses = [];
  let marks = [];
  let animationFrame = null;
  let mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };
    buildNetwork();
  }

  function buildNetwork() {
    const spacing = width < 720 ? 118 : 145;
    const cols = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;
    nodes = [];
    links = [];
    pulses = [];
    marks = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        nodes.push({
          x: col * spacing - spacing * 0.5 + (Math.random() - 0.5) * 46,
          y: row * spacing - spacing * 0.5 + (Math.random() - 0.5) * 46,
          drift: Math.random() * Math.PI * 2,
          radius: 1.3 + Math.random() * 1.8
        });
      }
    }

    nodes.forEach((node, index) => {
      for (let offset = 1; offset <= 3; offset++) {
        const target = nodes[index + offset];
        if (!target) continue;
        const dx = node.x - target.x;
        const dy = node.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < spacing * 1.42 && Math.random() > 0.2) {
          links.push({ a: node, b: target, phase: Math.random() });
        }
      }
    });

    const pulseCount = Math.min(22, Math.max(8, Math.floor(links.length / 7)));
    for (let i = 0; i < pulseCount; i++) {
      pulses.push({
        link: links[Math.floor(Math.random() * links.length)],
        speed: 0.00008 + Math.random() * 0.00011,
        offset: Math.random()
      });
    }

    const markCount = width < 720 ? 10 : 24;
    for (let i = 0; i < markCount; i++) {
      marks.push({
        text: codeMarks[i % codeMarks.length],
        x: Math.random() * width,
        y: Math.random() * height,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  }, { passive: true });

  function drawSoftField(time) {
    const fields = [
      { x: 0.18, y: 0.24, r: 420, color: 'rgba(232, 230, 253, 0.72)' },
      { x: 0.84, y: 0.22, r: 460, color: 'rgba(255, 239, 230, 0.72)' },
      { x: 0.52, y: 0.78, r: 430, color: 'rgba(230, 244, 240, 0.7)' },
      { x: 0.18, y: 0.88, r: 360, color: 'rgba(254, 252, 240, 0.68)' }
    ];

    fields.forEach((field, index) => {
      const x = width * field.x + Math.sin(time * 0.00012 + index) * 36;
      const y = height * field.y + Math.cos(time * 0.00014 + index) * 32;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, field.r);
      gradient.addColorStop(0, field.color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, field.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawNetwork(time) {
    const parallaxX = (mouse.x - width / 2) * 0.008;
    const parallaxY = (mouse.y - height / 2) * 0.008;

    ctx.lineWidth = 1.25;
    links.forEach((link) => {
      const flicker = 0.45 + Math.sin(time * 0.0007 + link.phase * 6) * 0.2;
      ctx.strokeStyle = `rgba(93, 85, 250, ${0.16 * flicker})`;
      ctx.beginPath();
      ctx.moveTo(link.a.x + parallaxX, link.a.y + parallaxY);
      ctx.lineTo(link.b.x + parallaxX, link.b.y + parallaxY);
      ctx.stroke();
    });

    nodes.forEach((node) => {
      const x = node.x + Math.sin(time * 0.00035 + node.drift) * 4 + parallaxX;
      const y = node.y + Math.cos(time * 0.00032 + node.drift) * 4 + parallaxY;
      ctx.fillStyle = 'rgba(46, 187, 147, 0.42)';
      ctx.beginPath();
      ctx.arc(x, y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
      ctx.beginPath();
      ctx.arc(x, y, node.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });

    pulses.forEach((pulse) => {
      if (!pulse.link) return;
      const progress = (time * pulse.speed + pulse.offset) % 1;
      const x = pulse.link.a.x + (pulse.link.b.x - pulse.link.a.x) * progress + parallaxX;
      const y = pulse.link.a.y + (pulse.link.b.y - pulse.link.a.y) * progress + parallaxY;
      ctx.fillStyle = 'rgba(250, 143, 85, 0.62)';
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawCodeMarks(time) {
    ctx.font = '12px "Fira Code", monospace';
    ctx.textBaseline = 'middle';
    marks.forEach((mark) => {
      const alpha = 0.1 + (Math.sin(time * 0.001 + mark.phase) + 1) * 0.04;
      ctx.fillStyle = `rgba(45, 43, 40, ${alpha})`;
      ctx.fillText(mark.text, mark.x, mark.y + Math.sin(time * 0.0005 + mark.phase) * 8);
    });
  }

  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height);

    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    drawSoftField(time);
    drawNetwork(time);
    drawCodeMarks(time);

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  }

  resize();
  draw();

  window.addEventListener('beforeunload', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
}

/* ==========================================================================
   2. Interactive Network Graph (Business Card Card)
   ========================================================================== */
function initNetworkCanvas() {
  const canvas = document.getElementById('network-nodes-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);
  let animationFrame = null;
  let isVisible = true;
  
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      width = (canvas.width = entry.contentRect.width);
      height = (canvas.height = entry.contentRect.height);
    }
  });
  resizeObserver.observe(canvas);
  
  const nodeCount = 18;
  const nodes = [];
  
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 3 + 2
    });
  }
  
  let pointer = { x: -1000, y: -1000, active: false };
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  });
  
  canvas.addEventListener('mouseleave', () => {
    pointer.active = false;
  });
  
  function draw() {
    animationFrame = null;
    if (!isVisible && !reducedMotion) return;

    ctx.clearRect(0, 0, width, height);
    
    // Draw links
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 80) {
          ctx.strokeStyle = `rgba(46, 187, 147, ${1 - dist / 80})`; // Mint green connections
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      
      // Pointer attraction links
      if (pointer.active) {
        const pdx = nodes[i].x - pointer.x;
        const pdy = nodes[i].y - pointer.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < 100) {
          ctx.strokeStyle = `rgba(93, 85, 250, ${0.8 - pdist / 100})`; // Purple links to cursor
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
          ctx.lineWidth = 0.8;
        }
      }
    }
    
    // Move and Draw nodes
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#2ebb93';
      ctx.fill();
    });
    
    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  }
  
  draw();

  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible && !animationFrame) {
        draw();
      } else if (!isVisible && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    }, { rootMargin: '120px' });
    observer.observe(canvas);
  }
}

/* ==========================================================================
   3. Retro Command Terminal Simulator (Geek Card)
   ========================================================================== */
function initTerminal() {
  const body = document.getElementById('terminal-body');
  const input = document.getElementById('terminal-input-field');
  const badgeContainer = document.querySelector('.terminal-commands-list');
  if (!body || !input) return;
  
  const cmdDb = {
    help: 'Available commands: <span class="cmd-badge" onclick="executeCmdString(\'about\')">about</span>, <span class="cmd-badge" onclick="executeCmdString(\'skills\')">skills</span>, <span class="cmd-badge" onclick="executeCmdString(\'tivo\')">tivo</span>, <span class="cmd-badge" onclick="executeCmdString(\'xmpp\')">xmpp</span>, <span class="cmd-badge" onclick="executeCmdString(\'vodafone\')">vodafone</span>, <span class="cmd-badge" onclick="executeCmdString(\'menu\')">menu</span>, <span class="cmd-badge" onclick="executeCmdString(\'clear\')">clear</span>',
    about: 'Paul Willard: Systems Engineer & manager who has studied business management (MBA). Been using Debian Linux since 2005. Drives trucks for fun and runs telecom businesses.',
    skills: 'Linux Administration, Bash, PHP (Wizardry), Network Routing (Mikrotik, Ubiquiti, Legrand) layer2 and layer3, Intrusion Detection, VOIP Solutions, VMware/KVM Virtualization.',
    tivo: 'Hacked TiVo devices back in the early 2000s to function natively in New Zealand before they were officially launched. Geeking out is a habit.',
    xmpp: 'Ran the largest XMPP/Jabber chat server in New Zealand for many years, hosting thousands of users, until spammers ruined the fun.',
    vodafone: 'The lead developer in the creation and production release of ringtones being sent over the air to cellphones.',
    menu: 'Orbit menu hint restored. Look to the navigation control on the right.',
    clear: 'CLEAR'
  };
  
  // Custom click binding for badges
  window.executeCmdString = function(cmd) {
    input.value = cmd;
    handleCommand(cmd);
  };
  
  if (badgeContainer) {
    badgeContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('cmd-badge')) {
        const cmd = e.target.textContent;
        input.value = cmd;
        handleCommand(cmd);
      }
    });
  }
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value.trim().toLowerCase();
      handleCommand(val);
    }
  });
  
  function writeLine(text, isInput = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (isInput) {
      line.innerHTML = `<span class="terminal-prompt">pwnz$</span> <span>${text}</span>`;
    } else {
      line.innerHTML = `<span>${text}</span>`;
    }
    
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }
  
  function handleCommand(cmd) {
    if (!cmd) return;
    writeLine(cmd, true);
    input.value = '';
    
    setTimeout(() => {
      if (cmd === 'clear') {
        body.innerHTML = '';
        writeLine('Terminal Cleared. Type <span class="cmd-badge" onclick="executeCmdString(\'help\')">help</span> to begin.');
      } else if (cmd === 'menu') {
        if (window.showOrbitMenuHint) window.showOrbitMenuHint();
        writeLine(cmdDb[cmd]);
      } else if (cmdDb[cmd]) {
        writeLine(cmdDb[cmd]);
      } else {
        writeLine(`bash: command not found: ${cmd}. Type <span class="cmd-badge" onclick="executeCmdString(\'help\')">help</span> for assistance.`);
      }
    }, 150);
  }
}

/* ==========================================================================
   4. Hobbies Selector (Personal Card)
   ========================================================================== */
function initHobbiesSelector() {
  const buttons = document.querySelectorAll('.hobby-btn');
  const details = document.getElementById('hobby-detail-display');
  const prevBtn = document.getElementById('hobby-prev');
  const nextBtn = document.getElementById('hobby-next');
  const status = document.getElementById('hobby-carousel-status');
  if (buttons.length === 0 || !details) return;
  
  const hobbiesData = {
    dancing: {
      title: 'The Dancer',
      desc: "I've been dancing around the country, attending competitions, getting involved in team events, and improving with workshops and one-on-one lessons. In 2014 I secured my first trophy (a 3rd place) and continue to hope for a first place.",
      pic: 'assets/images/Dancing_with_Una.webp',
      extra: 'Competition dancing, team events, workshops, and one-on-one lessons.'
    },
    motorcycles: {
      title: 'The Motorcyclist',
      desc: 'I am an avid motorcyclist. I enjoy touring around New Zealand, finding complex roads with great scenery.<br><br>I particularly like playing around with suspension, and cornering in motorcycles, be it on my previous lazy cruiser (Harley Davidson, FXDF), or my hoon bike (Suzuki SV1000s). I\'ve found some really great documentation about suspension tuning ( <a href="suspension.html">found here</a> ).',
      pic: 'assets/images/Paul-on-a-harley.webp',
      extra: 'Touring, complex roads, suspension tuning, and cornering.'
    },
    hiking: {
      title: 'The Hiker',
      desc: "I've walked all around the forest in New Zealand, climbing a few mountains, and crossing a few rivers. I love the peace and serenity of spending a night cooking over a small stove, sleeping under New Zealand’s beautiful bush canopy.",
      pic: 'assets/images/tramping.webp',
      extra: 'Forest walks, mountains, rivers, camp cooking, and nights under the bush canopy.'
    },
    snowboard: {
      title: 'The Snowboarder',
      desc: "In 2018 I decided I was going to learn how to snowboard. Like everything else I went at it 110%. I bought the gear; I bought heaps of day passes for the mountain; and I've spent way too many early mornings making my way to the slopes. In December 2018 I went snow boarding on the amazing slopes at Méribel, France.",
      pic: 'assets/images/snowboarder-paul.webp',
      extra: 'Whakapapa mornings, day passes, gear, and Méribel, France.'
    },
    geek: {
      title: 'The Geek',
      desc: 'Being a geek isn\'t just a career choice, it\'s a way of life. I do all sorts of stuff (mainly in Linux, but not always). I keep a blog of some of the things I do at <a href="https://terminaladdict.com" target="_blank" rel="noreferrer noopener">Terminal Addict - Linux and Sysadmin tips and tricks</a>.',
      pic: 'assets/images/terminaladdict-blog.webp',
      extra: 'Linux, sysadmin notes, tinkering, and Terminal Addict.'
    },
    adventures: {
      title: 'My Adventures',
      desc: 'I keep a personal blog! I\'m quite sporadic in my blogging. Sometimes I blog a bit, sometimes I go long stretches with no blogging. If I think I have something interesting to say then I blog. My personal blog can be found at <a href="https://www.loudas.com" target="_blank" rel="noreferrer noopener">LoudAs - The life and times of Paul Willard</a>',
      pic: 'assets/images/loudas-blog.webp',
      extra: 'Personal writing, stories, and occasional updates at LoudAs.'
    },
    fishing: {
      title: 'The Fisherman',
      desc: "Since meeting my school friends in 6th form, at Western Heights High School, Rotorua (Mark, Dave, and Jason), I've fished. Mark and Dave are keen fishermen, and later when Matt Macaskill go old enough, he too was a keen fisherman. I'm really bad 🤣. So many days fishing have resulted in no fish, but I still love it 🎣.",
      pic: 'assets/images/mount_maunganui_boat_trip.webp',
      extra: 'Sea trips, old school friends, plenty of effort, and not always many fish.'
    },
    dogs: {
      title: 'The Dog Lover',
      desc: "I love owning a dog 🐶 ! All my life I've owned a dog, except for a few short years as a teenager. Current I have Penny the Chocolate Labrador. She was born 9th November, 2022. She's lovely 💖 💞",
      pic: 'assets/images/Penny.webp',
      extra: 'Penny the Chocolate Labrador, born 9th November, 2022.'
    },
    aquarist: {
      title: 'The Aquarist',
      desc: 'Yes Aquarist is a word 😂 - "a person who keeps an aquarium". In my early 20s I was introduced to keeping tropical fish. It\'s a hobby that comes and goes, sometimes the commitment involved in keeping fish is too much (especially if I\'m travelling a lot / away from home a lot).',
      pic: 'assets/images/africans.webp',
      extra: 'Tropical fish, aquarium keeping, and the commitment that comes with it.'
    },
    cars: {
      title: 'The Car Nut',
      desc: "I've had a few classic cars in my life. Early in 2025 I bought an average quality 1975 Mini Clubman. I spent all 2025 restoring it. such a cool car to drive ⛐",
      pic: 'assets/images/the_mini.webp',
      extra: 'Classic cars and a restored 1975 Mini Clubman.'
    },
    hunting: {
      title: 'The Hunter',
      desc: "I like to go walking in the bush stalking deer. I'm not very good, but y'know, I try 😂 🎯",
      pic: 'assets/images/hunting.webp',
      extra: 'Bush walking, deer stalking, and keeping at it.'
    },
    camping: {
      title: 'The Camper',
      desc: 'I love being in the bush 🏕️ I\'ve built myself a overlander truck, with raised suspension, winch, a tent on top, a fridge and freezer 🛻 I reckon a campervan will be in my life soon!',
      pic: 'assets/images/camping.webp',
      extra: 'Overlander truck, roof tent, winch, fridge, freezer, and bush time.'
    }
  };
  
  const hobbyKeys = Array.from(buttons).map((btn) => btn.dataset.hobby);
  let currentIndex = Math.max(0, hobbyKeys.indexOf(document.querySelector('.hobby-btn.active')?.dataset.hobby));

  function isMobileHobbyView() {
    return window.matchMedia('(max-width: 800px)').matches;
  }

  function updateStatus() {
    if (!status) return;
    const activeLabel = buttons[currentIndex]?.querySelector('span')?.textContent || 'Hobby';
    status.textContent = `${activeLabel} · ${currentIndex + 1} / ${hobbyKeys.length}`;
  }

  function syncActiveButton() {
    buttons.forEach((button, index) => {
      const active = index === currentIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.setAttribute('tabindex', active ? '0' : '-1');
      if (active && isMobileHobbyView()) {
        button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  function renderHobby(index, scrollToDetails = false) {
    currentIndex = (index + hobbyKeys.length) % hobbyKeys.length;
    const key = hobbyKeys[currentIndex];
    const data = hobbiesData[key];
    if (!data) return;

    syncActiveButton();
    updateStatus();
    details.setAttribute('aria-labelledby', `hobby-tab-${key}`);
    details.style.opacity = 0;
    details.style.transform = 'scale(0.98)';

    setTimeout(() => {
      details.innerHTML = `
        <div class="hobby-detail-top">
          <div class="hobby-pic-frame">
            <img src="${data.pic}" width="300" height="240" class="hobby-pic js-image-modal" alt="${data.title}" data-modal-image="${data.pic}" data-modal-title="${data.title}" loading="lazy" decoding="async" />
          </div>
          <div class="hobby-text-container">
            <h3 class="hobby-detail-title">${data.title}</h3>
            <p class="hobby-desc">${data.desc}</p>
          </div>
        </div>
        <div class="hobby-extra-detail">${data.extra}</div>
      `;
      details.style.opacity = 1;
      details.style.transform = 'scale(1)';
      if (scrollToDetails && isMobileHobbyView()) {
        details.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }

  buttons.forEach((btn, index) => {
    btn.setAttribute('aria-selected', String(index === currentIndex));
    btn.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
    btn.addEventListener('click', () => {
      renderHobby(index, isMobileHobbyView());
    });
    btn.addEventListener('keydown', (event) => {
      const keyActions = {
        ArrowRight: 1,
        ArrowDown: 1,
        ArrowLeft: -1,
        ArrowUp: -1
      };
      if (event.key === 'Home') {
        event.preventDefault();
        renderHobby(0, false);
        buttons[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        renderHobby(buttons.length - 1, false);
        buttons[buttons.length - 1]?.focus();
      } else if (event.key in keyActions) {
        event.preventDefault();
        const nextIndex = (index + keyActions[event.key] + buttons.length) % buttons.length;
        renderHobby(nextIndex, false);
        buttons[nextIndex]?.focus();
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => renderHobby(currentIndex - 1, false));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => renderHobby(currentIndex + 1, false));
  }

  let touchStartX = 0;
  let touchStartY = 0;

  details.addEventListener('touchstart', (event) => {
    if (!isMobileHobbyView()) return;
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  details.addEventListener('touchend', (event) => {
    if (!isMobileHobbyView()) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      renderHobby(currentIndex + (deltaX < 0 ? 1 : -1), false);
    }
  }, { passive: true });

  updateStatus();
}

/* ==========================================================================
   6. Testimonials Carousel Slider
   ========================================================================= */
function initTestimonialsSlider() {
  const track = document.getElementById('testimonial-track');
  const indicators = document.getElementById('testimonial-indicators');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (!track || !indicators) return;

  const testimonials = [
    {
      name: 'Aleks Skomski',
      title: 'Telecommunications Engineer, Lightwire',
      img: 'assets/images/AleksSkomski.jpg',
      quote: 'Working both alongside and for Paul in the IT and telecommunications industry, he has proven to be great colleague, leader and manager. His wide ranging knowledge and skills are a conclusive asset to any employer.'
    },
    {
      name: 'Jason Brand',
      title: 'Managing Director, Wanna Internet',
      img: 'assets/images/JasonBrand.jpg',
      quote: 'Paul designed and implemented key technical systems that enabled the business to operate in a more efficient way and better maintain relations and make improvements with the company’s customer engagements.'
    },
    {
      name: 'Shane Hobson',
      title: 'Solution Architect, Velocity Networks',
      img: 'assets/images/ShaneHobson.jpg',
      quote: 'Velocity has used Paul and his team at NetValue to provide a number of web based solutions for us. Including a secured wiki and interactive, database driven web pages. The projects have always been delivered on time, on budget and often exceed our required performance criteria.'
    },
    {
      name: 'Wayne Atwell',
      title: 'Brand Strategy Consultant, author of Smart Marketing, Bold Horizon',
      img: 'assets/images/WayneAtwell.jpg',
      quote: 'Paul has worked on a number of projects with us and has always delivered a great service and on time. He definitely knows his stuff when it comes to IT and sysadmin.'
    },
    {
      name: 'Rosemary Leader',
      title: 'General Manager, Hillside Hotel',
      img: 'assets/images/RosemaryLeader.jpg',
      quote: 'Paul would have to be one of the most ethical people I know. In his time on the Fraser High School Board of Trustees he made good governance and integrity a priority and in doing so showed true grit in a challenging situation.'
    },
    {
      name: 'Dave McNeill',
      title: 'Owner, McPond Software',
      img: 'assets/images/DaveMcNeill.jpg',
      quote: 'Paul is effective, efficient and very capable. He has in depth technical knowledge and experience, and can get things done. He is organised and in control of his team. I like the way he thinks through the angles of a particular change or system, to understand the downstream impacts and consequences.'
    },
    {
      name: 'Ross Brewer',
      title: 'Owner, CST Group',
      img: 'assets/images/Ross Brewer.jpg',
      quote: 'We have been using Paul from Central Communications for years now, and the experience has been great. Their state-of-the-art technology and seamless integration have significantly enhanced our communication capabilities. The reliability and clarity of his service has ensured that our team stays connected and productive, even during peak times. The customer support is always responsive, knowledgeable, and ready to assist with any queries. We highly recommend Paul to any business looking for a top-tier VOIP phone system solution.'
    },
    {
      name: 'Sophia Donnelly',
      title: 'Business Manager, Matamata Veterinary Services',
      img: 'assets/images/Sophia Donnelly.jpg',
      quote: 'Paul and the Central Communications team have been great to deal with regarding our communications requirements. They are only ever a phone call away if we need assistance, and consistently provide excellent service and advice. Being rural-based, a reliable phone system is critical for us to connect with our clients, and the Central Communications team doesn’t disappoint.'
    },
    {
      name: 'Ian McMichael',
      title: 'Owner, Pharmacy 547 / Anglesea Pharmacy',
      img: 'assets/images/Ian McMichael.jpg',
      quote: 'We have found Paul especially approachable, and operates in a “can do” spirit. Nothing is too much of a bother when it comes to problem solving. We highly recommend Paul and Central Communications.'
    },
    {
      name: 'Aaron Keppler',
      title: 'Owner, Keppler GWM/Haval, and KVI',
      img: 'assets/images/Aaron Keppler.jpg',
      quote: 'We have worked with Paul and Central Communications for numerous years, starting with basic IT assistance and now running our full phone services [internet, and managed Wifi, and structured data cabling in the new building] with them. Paul and the Central Communications team are incredibly friendly and always there to assist any time of day. It is important to have partnerships with companies that allow you to focus on your own business and Central Communications gives me and my team the confidence that we can trust our phone services and IT systems are always going to be working.'
    },
    {
      name: 'Alan Hurford',
      title: 'IT Manager, Greenlea Premier Meats Ltd',
      img: 'assets/images/Alan Hurford.jpg',
      quote: 'Paul from Central Communications Limited was contracted by Greenlea Premier to supply, install and maintain security camera systems on our two Waikato Beef Processing Plants. Paul displayed excellent product and technical experience in camera and network server deployment. We would have no hesitation in allowing Paul access to any of our site areas and equipment.'
    },
    {
      name: 'Peter Billingham',
      title: 'TiC Digital Technology, Matamata College',
      img: 'assets/images/Peter Billingham.jpg',
      quote: 'I have been dealing with Paul Willard who has been managing and installing our security cameras here at Matamata College since he took over Central Communications in 2021. During this time Paul has always acted in a professional manner, keeping our cameras functioning well and ensuring security of our camera feed. Paul has provide expert advice and guidance.'
    }
  ];

  function testimonialThumb(src) {
    const filename = src.split('/').pop();
    const base = filename.replace(/\.[^.]+$/, '').replace(/\s+/g, '-');
    return `assets/images/optimized/${base}-96.webp`;
  }

  track.innerHTML = testimonials.map((item, index) => `
    <div class="testimonial-card-slide${index === 0 ? ' active' : ''}">
      <a class="testimonial-slide-link" href="testimonials.html">
        <div class="testimonial-quote-box">
          <p class="testimonial-quote">"${item.quote}"</p>
        </div>
        <div class="testimonial-user">
          <img src="${testimonialThumb(item.img)}" width="96" height="96" class="testimonial-avatar js-image-modal" alt="${item.name}" data-modal-image="${item.img}" data-modal-title="${item.name}" loading="lazy" decoding="async">
          <div>
            <h3 class="testimonial-name">${item.name}</h3>
            <div class="testimonial-title">${item.title}</div>
          </div>
        </div>
      </a>
    </div>
  `).join('');

  indicators.innerHTML = testimonials.map((item, index) => `
    <button class="indicator-dot${index === 0 ? ' active' : ''}" type="button" data-index="${index}" aria-label="Show testimonial from ${item.name}" aria-current="${index === 0 ? 'true' : 'false'}"></button>
  `).join('');

  const slides = track.querySelectorAll('.testimonial-card-slide');
  const dots = indicators.querySelectorAll('.indicator-dot');
  
  let currentIndex = 0;
  let timer = null;
  
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'exit');
      if (i === currentIndex) {
        slide.classList.add('exit');
      }
    });
    
    dots.forEach((dot) => {
      dot.classList.remove('active');
      dot.setAttribute('aria-current', 'false');
    });
    
    currentIndex = index;
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
    dots[currentIndex].setAttribute('aria-current', 'true');
  }
  
  function nextSlide() {
    let nextIdx = (currentIndex + 1) % slides.length;
    showSlide(nextIdx);
  }

  function previousSlide() {
    let prevIdx = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIdx);
  }
  
  function startAutoCycle() {
    timer = setInterval(nextSlide, 7000);
  }
  
  function stopAutoCycle() {
    if (timer) clearInterval(timer);
  }
  
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      stopAutoCycle();
      const idx = parseInt(dot.dataset.index);
      showSlide(idx);
      startAutoCycle();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoCycle();
      previousSlide();
      startAutoCycle();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoCycle();
      nextSlide();
      startAutoCycle();
    });
  }
  
  startAutoCycle();
}

/* ==========================================================================
   7. Beard Interactive Tilt / Parallax (Contact Card)
   ========================================================================== */
function initBeardTilt() {
  const container = document.querySelector('.beard-image-container');
  if (!container) return;
  
  const img = container.querySelector('.beard-img');
  let rect = null;

  function updateRect() {
    rect = container.getBoundingClientRect();
  }

  container.addEventListener('pointerenter', updateRect, { passive: true });
  window.addEventListener('resize', () => {
    rect = null;
  }, { passive: true });
  
  container.addEventListener('mousemove', (e) => {
    if (!rect) updateRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const angleX = (yc - y) / 12; // tilt factors
    const angleY = (x - xc) / 12;
    
    container.style.transform = `perspective(600px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.03)`;
    if (img) {
      img.style.transform = `scale(1.08) translate(${-angleY * 0.5}px, ${-angleX * 0.5}px)`;
    }
  });
  
  container.addEventListener('mouseleave', () => {
    container.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    if (img) {
      img.style.transform = 'scale(1) translate(0px, 0px)';
    }
  });
}

/* ==========================================================================
   8. Liquid Menu Path Morphing
   ========================================================================== */
function initOrbitMenu() {
  const orbit = document.querySelector(".nav-orbit");
  const navButton = document.querySelector(".nav-toggle");
  if (!orbit || !navButton) return;

  function toggleMenu(open) {
    orbit.dataset.open = String(open);
    navButton.setAttribute("aria-expanded", String(open));
    navButton.setAttribute("aria-label", open ? "Close navigation instrument" : "Open navigation instrument");
  }

  navButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = orbit.dataset.open === "true";
    toggleMenu(!isOpen);
  });

  // Close menu when clicking on any nav item
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      toggleMenu(false);
    });
  });

  // Close menu when clicking outside of the menu
  document.addEventListener("click", (e) => {
    const isOpen = orbit.dataset.open === "true";
    if (isOpen && !orbit.contains(e.target)) {
      toggleMenu(false);
    }
  });
}

function initOrbitMenuHint() {
  const hint = document.getElementById('orbit-menu-hint');
  const dismissBtn = document.getElementById('orbit-hint-dismiss');
  const navButton = document.querySelector('.nav-toggle');
  const orbit = document.querySelector('.nav-orbit');
  if (!hint || !navButton || !orbit) return;

  let hideTimer = null;

  function hideHint() {
    hint.classList.remove('visible');
    hint.classList.add('hidden');
    hint.setAttribute('aria-hidden', 'true');
    hint.setAttribute('inert', '');
    if (hideTimer) clearTimeout(hideTimer);
  }

  function showHint() {
    if (hideTimer) clearTimeout(hideTimer);
    hint.classList.add('visible');
    hint.classList.remove('hidden');
    hint.setAttribute('aria-hidden', 'false');
    hint.removeAttribute('inert');
    hideTimer = setTimeout(hideHint, 11000);
  }

  window.showOrbitMenuHint = showHint;

  setTimeout(showHint, 900);

  navButton.addEventListener('click', hideHint);
  orbit.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', hideHint));
  if (dismissBtn) dismissBtn.addEventListener('click', hideHint);
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) hideHint();
  }, { passive: true });
}

function initMailLinks() {
  document.querySelectorAll('a[data-mail]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const mailbox = link.dataset.mail;
      if (!mailbox) return;
      window.location = `mailto:${mailbox}@paulwillard.nz?subject=Contact from website`;
    });
  });
}

function initGstCalculator() {
  const form = document.getElementById('gstform');
  if (!form) return;

  const exclusiveInput = document.getElementById('GSTExclusivePrice');
  const inclusiveInput = document.getElementById('GSTInclusivePrice');
  const gstInput = document.getElementById('GSTContent');
  const errorMessage = document.getElementById('gst-error-message');

  if (!exclusiveInput || !inclusiveInput || !gstInput) return;

  function parseAmount(input) {
    const rawValue = input.value.trim().replace(/,/g, '');
    const value = Number(rawValue);

    if (rawValue === '' || !Number.isFinite(value) || value < 0) {
      input.classList.add('gst-input-error');
      if (errorMessage) {
        errorMessage.textContent = 'Positive digits and decimals only please.';
      }
      return null;
    }

    input.classList.remove('gst-input-error');
    if (errorMessage) errorMessage.textContent = '';
    return value;
  }

  function formatAmount(value) {
    return value.toLocaleString('en-NZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function setAmounts(exclusive, inclusive, gst) {
    exclusiveInput.value = formatAmount(exclusive);
    inclusiveInput.value = formatAmount(inclusive);
    gstInput.value = formatAmount(gst);
  }

  function clearErrors() {
    [exclusiveInput, inclusiveInput, gstInput].forEach((input) => {
      input.classList.remove('gst-input-error');
    });
    if (errorMessage) errorMessage.textContent = '';
  }

  form.addEventListener('submit', (event) => event.preventDefault());

  form.querySelector("button[name='CalcGST']")?.addEventListener('click', (event) => {
    event.preventDefault();
    clearErrors();
    const exclusive = parseAmount(exclusiveInput);
    if (exclusive === null) return;

    setAmounts(exclusive, exclusive * 1.15, exclusive * 0.15);
  });

  form.querySelector("button[name='CalcInclGST']")?.addEventListener('click', (event) => {
    event.preventDefault();
    clearErrors();
    const inclusive = parseAmount(inclusiveInput);
    if (inclusive === null) return;

    const gst = (3 * inclusive) / 23;
    setAmounts(inclusive - gst, inclusive, gst);
  });

  form.querySelector("button[name='CalcGSTContent']")?.addEventListener('click', (event) => {
    event.preventDefault();
    clearErrors();
    const gst = parseAmount(gstInput);
    if (gst === null) return;

    const inclusive = (23 * gst) / 3;
    setAmounts(inclusive - gst, inclusive, gst);
  });

  form.querySelector("button[name='CalcGSTClear']")?.addEventListener('click', (event) => {
    event.preventDefault();
    clearErrors();
    exclusiveInput.value = 0;
    inclusiveInput.value = 0;
    gstInput.value = 0;
  });
}

function initImageModal() {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');
  modal.innerHTML = `
    <div class="image-modal-backdrop" data-image-modal-close></div>
    <div class="image-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="image-modal-title">
      <div class="image-modal-header">
        <h2 id="image-modal-title">Image preview</h2>
        <button class="image-modal-close" type="button" data-image-modal-close aria-label="Close image preview">&times;</button>
      </div>
      <div class="image-modal-body">
        <img class="image-modal-img" src="" alt="">
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const image = modal.querySelector('.image-modal-img');
  const title = modal.querySelector('#image-modal-title');
  const closeButton = modal.querySelector('.image-modal-close');
  let lastFocus = null;

  function imageTitle(trigger) {
    return trigger.dataset.modalTitle || trigger.getAttribute('alt') || trigger.getAttribute('title') || 'Image preview';
  }

  function imageSource(trigger) {
    return trigger.dataset.modalImage || trigger.getAttribute('href') || trigger.getAttribute('src');
  }

  function openModal(trigger) {
    const src = imageSource(trigger);
    if (!src) return;

    lastFocus = document.activeElement;
    const displayTitle = imageTitle(trigger);
    const shouldFillModal = trigger.dataset.modalFit === 'contain' || src.includes('/trucks/');
    title.textContent = displayTitle;
    image.src = src;
    image.alt = displayTitle;
    modal.classList.toggle('image-modal-fill', shouldFillModal);
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    modal.removeAttribute('inert');
    document.body.classList.add('modal-open');
    closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.body.classList.remove('modal-open');
    image.removeAttribute('src');
    image.alt = '';
    modal.classList.remove('image-modal-fill');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  document.addEventListener('click', (event) => {
    const closeTrigger = event.target.closest('[data-image-modal-close]');
    if (closeTrigger) {
      event.preventDefault();
      closeModal();
      return;
    }

    const trigger = event.target.closest('[data-modal-image]');
    if (!trigger) return;

    event.preventDefault();
    openModal(trigger);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('visible')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   10. Scroll Animations Reveal
   ========================================================================== */
function initScrollAnimations() {
  const cards = document.querySelectorAll('.bento-card');
  if (cards.length === 0) return;

  function revealCard(card) {
    card.style.opacity = 1;
    card.style.transform = 'translateY(0)';
  }

  if (!('IntersectionObserver' in window)) {
    cards.forEach(revealCard);
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealCard(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  cards.forEach(card => {
    // Initial states set via JS to avoid flicker
    card.style.opacity = 0;
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(card);
  });

  setTimeout(() => {
    cards.forEach((card) => {
      if (card.style.opacity === '0') {
        revealCard(card);
        observer.unobserve(card);
      }
    });
  }, 1200);
}
