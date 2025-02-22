<!---------- Header ------------->
<header>
  <div class="top-container">
    <!-- Show the frequency number -->
    {{FreqSort}}
    <!-- The frequency dropdown icon -->
    {{#Frequency}}
      <span class="freq-dropdown">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" class="dropdown-arrow-svg" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
            <path d="M 12.7,6.5 H 3.3 L 8,11 Z"></path>
        </svg>
      </span>
    {{/Frequency}}

    <!-- The frequency list -->
    <div class="freq-list-container"></div>
  </div>
</header>

<main>

  <div class="template">
    <!-- The first row (vocab box+picture) -->
    <div class="def-header">
      <div class="dh-left">
        <div class="show-furigana vocab">
          {{#ExpressionFurigana}}{{furigana:ExpressionFurigana}}{{/ExpressionFurigana}}
          {{^ExpressionFurigana}}{{Expression}}{{/ExpressionFurigana}}
        </div>

        <!-- Reading + Pitch Accent -->
        <div class="info">
        <div class="pitch">
          <div style="margin-right: -15px; display: inline">
            {{#ExpressionFurigana}}{{kana:ExpressionFurigana}}{{/ExpressionFurigana}}
            {{^ExpressionFurigana}}{{ExpressionReading}}{{/ExpressionFurigana}}
          </div>
        </div>

        <!-- Pitch Accent -->
        {{#PitchPosition}}
        <span id="pitch-tags" class="tags"> {{PitchPosition}} </span>
        {{/PitchPosition}}
        <br/>
        <div class="audio-buttons">{{ExpressionAudio}} {{SentenceAudio}}</div>
      </div>
      </div>

      <!-- Image -->
      <div class="dh-right">
        {{#Picture}}
          <div class="image {{Tags}}">{{Picture}}</div>
        {{/Picture}}
      </div>
    </div>


  <!-- This is for the sentence that you see on mobile (positioned under definition), on Desktop, the sentence goes above the definition box, and this is hidden -->
  <div class="sentence-mobile">
    {{#SentenceFurigana}} {{furigana:SentenceFurigana}} {{/SentenceFurigana}}
    {{^SentenceFurigana}} {{furigana:Sentence}} {{/SentenceFurigana}}
  </div>
		 <div class="sentence-mobile">
		<button id="copyBtnSentence">📋 Copy Sentence</button>
		</div>
    <br>
    <div class="sentence">
      {{#SentenceFurigana}} {{furigana:SentenceFurigana}} {{/SentenceFurigana}}
      {{^SentenceFurigana}} {{furigana:Sentence}} {{/SentenceFurigana}}
    </div>



  <!-- The entire definition blockquote -->
  <div class="def-info-container"><div class="def-info"></div></div>
    <blockquote class="main-def def-blockquote">
      <div class="definition">
        {{#SelectionText}}{{SelectionText}}{{/SelectionText}}
      </div>
    </blockquote>

  <!------- Image modal --------->
  <div class="modal-bg"></div>
  <div class="img-popup"></div>

  {{#MiscInfo}}
    <div style="text-align: center">
      <div>
        <details>
          <summary>Misc. info</summary>
          <div class="misc-info popup">
            === Details ===
            <br />
            {{MiscInfo}}
          </div>
        </details>
      </div>
    </div>
  {{/MiscInfo}}
</main>

<!----------- Footer ------------->
<footer>
  <br>
  <div class="bot-container">
    {{#Tags}}
    <div class="tags-container">
      <div class="tags">{{Tags}}</div>
    </div>
    {{/Tags}}
  </div>
</footer>

<!----------- Scripts ------------>
<script>
  // This code is concerned with calculating the Pitch Accent and constructing the pitch accent graphs
  function isOdaka(pitchNumber) {
    const kana = `{{kana:ExpressionFurigana}}` || `{{ExpressionReading}}`;
    return (
      kana !== null &&
      kana.replace(/[ャュョゃゅょ]/g, "").length === pitchNumber
    );
  }

  function endsWithAny(suffixes, string) {
    for (let suffix of suffixes) {
      if (string.endsWith(suffix)) return true;
    }
    return false;
  }

  function getPitchType(pitchPosition) {
    if (
      endsWithAny(
        ["い", "う", "く", "す", "つ", "ぶ", "む", "る"],
        "{{Expression}}".replace("</div>", ""),
      )
    ) {
      if (pitchPosition === 0) {
        return "heiban";
      } else {
        return "kifuku";
      }
    } else {
      if (pitchPosition === 0) {
        return "heiban";
      } else if (pitchPosition === 1) {
        return "atamadaka";
      } else if (pitchPosition > 1) {
        return isOdaka(pitchPosition) ? "odaka" : "nakadaka";
      }
    }
  }

  // Show the color
  function paintTargetWord() {
    const pitchPositions = `{{PitchPosition}}`.match(/^\d+|\d+\b|\d+(?=\w)/g);
    if (pitchPositions === null) return;

    const pitchPosition = Number(pitchPositions[0]);
    const sentences = Array.from(
      document.querySelectorAll(".sentence, .definition, .sentence-mobile"),
    );
    for (const sentence of sentences) {
      for (const targetWord of sentence.getElementsByTagName("b")) {
        targetWord.classList.add(getPitchType(pitchPosition));
      }
    }

    const vocabElement = document.querySelector(".vocab");
    if (vocabElement !== null) {
      vocabElement.classList.add(getPitchType(pitchPosition));
    }
  }

  // Seperate Tags by space, and show them in their own boxes
  function tweakHTML() {
    // Split tags
    const tagsContainer = document.querySelector(".tags-container");
    const tags = `{{Tags}}`.split(" ");
    if (tagsContainer) {
      tagsContainer.innerHTML = "";
      for (tag of tags) {
        const tagElem = document.createElement("div");
        tagElem.className = "tags";
        tagElem.innerText = tag;
        tagsContainer.appendChild(tagElem);
      }
    }
  }

  function groupMoras(kana) {
    let currentChar = "";
    let nextChar = "";
    const groupedMoras = [];
    const check = ["ャ", "ュ", "ョ", "ゃ", "ゅ", "ょ"];

    for (let i = 0; i < kana.length; i++) {
      currentChar = kana[i];
      nextChar = i < kana.length - 1 && kana[i + 1];
      if (check.includes(nextChar)) {
        groupedMoras.push(currentChar + nextChar);
        i += 1;
      } else {
        groupedMoras.push(currentChar);
      }
    }
    return groupedMoras;
  }

  function getPitchPattern(pitchPosition) {
    // 0 = low
    // 1 = high
    // 2 = high to low

    const kana = `{{kana:ExpressionFurigana}}` || `{{ExpressionReading}}`;
    const moras = groupMoras(kana);
    let pattern = [];

    if (pitchPosition === 0) {
      // 平板
      pattern = [
        ...Array(moras[0].length).fill("0"),
        ...Array(kana.length - moras[0].length).fill("1"),
      ];
    } else if (pitchPosition === 1) {
      // 頭高
      pattern = [
        ...(moras[0].length === 2 ? ["1", "2"] : ["2"]),
        ...Array(kana.length - moras[0].length).fill("0"),
      ];
    } else if (pitchPosition > 1) {
      if (isOdaka(pitchPosition)) {
        // 尾高
        pattern = [
          ...Array(moras[0].length).fill("0"),
          ...Array(kana.length - moras[0].length - 1).fill("1"),
          "2",
        ];
      } else {
        // 中高
        let afterDrop = false;
        for (let i = 0; i < moras.length; i++) {
          if (i === 0) {
            pattern = Array(moras[0].length).fill("0");
          } else if (i + 1 === pitchPosition) {
            pattern =
              moras[i].length === 2
                ? [...pattern, "1", "2"]
                : [...pattern, "2"];
            afterDrop = true;
          } else if (afterDrop) {
            pattern = [...pattern, ...Array(moras[i].length).fill("0")];
          } else {
            pattern = [...pattern, ...Array(moras[i].length).fill("1")];
          }
        }
      }
    }
    return pattern;
  }

  function constructPitch() {
    const kana = `{{kana:ExpressionFurigana}}` || `{{ExpressionReading}}`;
    const pitch = document.querySelector(".pitch");
    const pitchTags = document.querySelector("#pitch-tags");
    const pitchPositions = `{{PitchPosition}}`.match(/^\d+|\d+\b|\d+(?=\w)/g);

    if (!pitchPositions) {
      pitch.innerHTML = `<div style="margin-right: -15px; display: inline;">${kana}</div>`;
      return;
    }

    const createPitchSpan = (pitchClass, pitchChar) => {
      const pitchSpan = document.createElement("span");
      const charSpan = document.createElement("span");
      const lineSpan = document.createElement("span");

      pitchSpan.classList.add(pitchClass);
      charSpan.classList.add("pitch-char");
      charSpan.innerText = pitchChar;
      lineSpan.classList.add("pitch-line");

      pitchSpan.appendChild(charSpan);
      pitchSpan.appendChild(lineSpan);

      return pitchSpan;
    };

    pitch.innerHTML = "";
    pitchTags.innerHTML = "";
    pitchTags.style.display = "inline-block";
    let uniquePitchPositions = [...new Set(pitchPositions)];

    const pitchList = document.createElement("ul");
    const pitchTagList = document.createElement("ul");

    for (let pitchPosition of uniquePitchPositions) {
      const pitchTag = document.createElement("li");
      pitchTag.textContent = pitchPosition;

      const pattern = getPitchPattern(Number(pitchPosition));

      const pitchItem = document.createElement("li");
      pitchItem.classList.add("pitch-item");
      pitchItem.classList.add(getPitchType(Number(pitchPosition)));

      for (let i = 0; i < kana.length; i++) {
        if (pattern[i] === "0")
          pitchItem.appendChild(createPitchSpan("pitch-low", kana[i]));
        else if (pattern[i] === "1")
          pitchItem.appendChild(createPitchSpan("pitch-high", kana[i]));
        else if (pattern[i] === "2")
          pitchItem.appendChild(createPitchSpan("pitch-to-drop", kana[i]));
        else
          console.error(
            "pattern[i] found undefined value. pattern is",
            pattern,
          );
      }
      pitchTagList.appendChild(pitchTag);
      pitchList.appendChild(pitchItem);
    }

    pitch.appendChild(pitchList);
    pitchTags.appendChild(pitchTagList);
  }

  // Helper function to check if a field is just html without any content
  function isAllHtml(content) {
    const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return strippedContent === "" && content.match(/<\/?[^>]+(>|$)/g) !== null;
  }

  // This function handles toggling definitions with click/key
  function toggleDef(index) {
    let dictNames = [];
    if (`{{SelectionText}}`) dictNames.push("Text Selection");
    if (`{{MainDefinition}}` && isAllHtml(`{{MainDefinition}}`) == false) dictNames.push("Primary Definition");
    if (`{{Glossary}}`) dictNames.push("Glossaries");

    const definitionContainer = document.querySelector(
      ".main-def > .definition",
    );

    const indexDisplay = document.querySelector(".def-info");
    indexDisplay.style.opacity = 1;

    currentIndex = index % dictNames.length;
    while (currentIndex < 0) currentIndex += dictNames.length;

    indexDisplay.innerText = `${dictNames[currentIndex]} ${currentIndex + 1}/${
      dictNames.length
    }`;

    if (dictNames[currentIndex].toLowerCase().includes("text selection")) {
      definitionContainer.innerHTML = `{{SelectionText}}`;
    }
    else if (dictNames[currentIndex].toLowerCase().includes("primary definition")) {
      definitionContainer.innerHTML = `<div id="primary">{{MainDefinition}}</div>`;
      hideCorrectDefinition();
    }
    else if (dictNames[currentIndex].toLowerCase().includes("glossar"))
      definitionContainer.innerHTML = `<div id="glossaries">{{Glossary}}</div>`;
  }

  function setUpDefToggle() {
    const mainDefContainer = document.querySelector(".main-def");

    const leftEdge = document.createElement("div");
    const rightEdge = document.createElement("div");
    leftEdge.classList.add("left-edge");
    leftEdge.classList.add("tappable");
    rightEdge.classList.add("right-edge");
    rightEdge.classList.add("tappable");
    mainDefContainer.appendChild(leftEdge);
    mainDefContainer.appendChild(rightEdge);

    let index = 0;

    leftEdge.addEventListener("click", (e) => {
      index -= 1;
      toggleDef(index);
    });

    rightEdge.addEventListener("click", (e) => {
      index += 1;
      toggleDef(index);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") index -= 1;
      else if (e.key === "ArrowRight") index += 1;

      toggleDef(index);
    });
  }

  // By default, it's going to be SelectionText in that field, but what if it is empty i.e user has not selected any text?
  function showCorrectDef() {
    const selectionText = document.querySelector(".main-def > .definition");
    if ((selectionText.innerHTML.trim() == "" && `{{MainDefinition}}`) && isAllHtml(`{{MainDefinition}}`) == false) {
      selectionText.innerHTML = `<div id="primary">{{MainDefinition}}</div>`;
    }
    else if (selectionText.innerHTML.trim() == "" && `{{MainDefinition}}` == "" || isAllHtml(`{{MainDefinition}}`) == true)
      selectionText.innerHTML = `<div id="glossaries">{{Glossary}}</div>`;
    }

  // This just handles clicking and showing images
  function clickImage() {
      const modalBg = document.querySelector(".modal-bg");
      const imgPopup = document.querySelector(".img-popup");
      const image = document.querySelector(".image img");

      if (!image) return;

      image.addEventListener("click", () => {
          const imgPopupContainer = document.createElement("div");
          const imgPopupImg = document.createElement("img");

          imgPopupContainer.classList.add("img-popup-container");
          imgPopupImg.src = image.src;
          imgPopupImg.classList.add("img-popup-img");

          if (image.height > image.width) {
              imgPopupContainer.style.height = "calc(100% - 20px)";
              imgPopupContainer.style.width = "max-content";
          }
          imgPopup.innerHTML = "";
          imgPopup.appendChild(imgPopupContainer);
          imgPopupContainer.appendChild(imgPopupImg);

          document.body.classList.add("img-popup");
          modalBg.style.display = "block";
          imgPopupContainer.style.display = "flex";
      });

      modalBg.addEventListener("click", () => {
          document.body.classList.remove("img-popup");
          modalBg.style.display = "none";
          imgPopup.innerHTML = "";
      });
  }

  // Handles what you see when you hover over frequency dropdown icon
  function frequencyHover() {
      const hoverTrigger = document.querySelector('.freq-dropdown');
      const frequencyElement = document.querySelector('.freq-list-container');

      hoverTrigger.addEventListener('mouseenter', function() {
          frequencyElement.innerHTML = `
              {{#Frequency}} {{Frequency}} {{/Frequency}}
          `;
          frequencyElement.classList.add('visible');
      });

      hoverTrigger.addEventListener('mouseleave', function() {
          frequencyElement.classList.remove('visible');
      });
  }

  // Sets the height of dhLeft, dhRight, defHeader as a whole
  function setDHHeight() {
    var dhLeft = document.querySelector('.dh-left');
    var dhRight = document.querySelector('.dh-right .image img');
    var defHeader = document.querySelector('.def-header')

    if (dhLeft && dhRight) {
        var dhLeftHeight = dhLeft.offsetHeight;
        dhRight.style.maxHeight = `${dhLeftHeight}px`;
        defHeader.style.maxHeight = `${dhLeftHeight}px`;
    }
  }

  // Hides the dictionary user selected in MainDefinition in Glossary field, if any
  function hideCorrectDefinition() {
    let primaryElement = document.querySelector("#primary li[data-dictionary]");
    console.log(primaryElement);

    if (primaryElement) {
        let dictionaryValue = primaryElement.getAttribute("data-dictionary");
        let style = document.createElement('style');

        style.type = 'text/css';
        const cssRules = `#glossaries li[data-dictionary="${dictionaryValue}"] { display:none !important; }`
        style.appendChild(document.createTextNode(cssRules));
        document.head.appendChild(style);
    }
  }

  // Initialize all functions!!!
  function initialize() {
    tweakHTML();
    paintTargetWord();
    constructPitch();
    showCorrectDef();
    setUpDefToggle();
    clickImage();
    frequencyHover();
    setDHHeight();
    hideCorrectDefinition();

    // Ensure script only runs on the BACK side of the card
    if (`{{IsClickCard}}` && typeof anki !== "undefined") {
      console.log("✅ Running ClickCard on BACK side.");
      ClickCard();
    } else {
      console.log("🚫 ClickCard not initialized on front.");
    }

  }

  initialize();


setTimeout(function() {
    console.log("📜 Checking SentenceFurigana...");

    // Ensure script only runs on the BACK side of the card
    if (typeof anki === "undefined") {
        console.log("🚫 Not on back side. Exiting script.");
        return;
    }

    const copyBtn = document.getElementById("copyBtnSentence");

    if (!copyBtn) {
        console.warn("❌ Copy button not found!");
        return;
    }

    function stripHtml(html) {
        // Convert HTML string into a temporary DOM element
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    }

    // Try to get plain text directly from {{Sentence}} or remove furigana
    let textToCopy = stripHtml(`{{text:SentenceFurigana}}`).trim() || stripHtml(`{{Sentence}}`).trim();
    console.log("🔍 Extracted Text:", textToCopy);

    if (!textToCopy || textToCopy === "") {
        console.warn("⚠️ No text found in SentenceFurigana.");
        copyBtn.innerText = "❌ No Text Found";
        copyBtn.disabled = true;
        return;
    }

    function copyToClipboard(text) {
        if (!text || text.trim() === "") {
            console.warn("⚠️ No text to copy.");
            alert("⚠️ No text to copy.");
            return;
        }

        navigator.clipboard.writeText(text).then(function() {
        }).catch(function(error) {
            console.warn("❌ Clipboard API failed. Trying fallback...", error);

            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand("copy");
            document.body.removeChild(textArea);

            if (success) {
                alert("✅ Copied (Fallback): " + text);
            } else {
                alert("❌ Copy failed. Clipboard blocked?");
            }
        });
    }

    copyBtn.addEventListener("click", function() {
        copyToClipboard(textToCopy);
    });

}, 1000);

</script>
