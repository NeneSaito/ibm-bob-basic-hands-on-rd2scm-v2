(function () {
  "use strict";

  var ALL = "すべて";
  var CATEGORIES = [ALL, "全般", "使い方", "高度な機能", "トラブルシューティング"];

  var selectedCategory = ALL;
  var query = "";

  var searchInput = document.getElementById("search-input");
  var categoryBox = document.getElementById("category-buttons");
  var resultCount = document.getElementById("result-count");
  var faqList = document.getElementById("faq-list");
  var emptyMessage = document.getElementById("empty-message");

  if (!searchInput || !categoryBox || !resultCount || !faqList || !emptyMessage) {
    console.error("FAQ: required DOM elements not found — aborting initialisation");
    return;
  }

  var categoryButtons = [];
  var items = [];

  // `コード` と **強調** を <code> と <strong> に変換して parent に追加する(innerHTML は使わない)
  function appendRichText(parent, text) {
    var pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
    text.split(pattern).forEach(function (part) {
      if (!part) {
        return;
      }
      if (part.charAt(0) === "`") {
        var code = document.createElement("code");
        code.textContent = part.slice(1, -1);
        parent.appendChild(code);
      } else if (part.indexOf("**") === 0) {
        var strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        parent.appendChild(strong);
      } else {
        parent.appendChild(document.createTextNode(part));
      }
    });
  }

  function stripMarkup(text) {
    return text.replace(/`/g, "").replace(/\*\*/g, "");
  }

  function buildSearchText(faq) {
    var texts = [faq.question];
    faq.answer.forEach(function (block) {
      if (block.type === "p") {
        texts.push(block.text);
      } else if (block.type === "ul") {
        block.items.forEach(function (t) {
          texts.push(t);
        });
      }
    });
    return stripMarkup(texts.join("\n")).toLowerCase();
  }

  function createItem(faq) {
    var root = document.createElement("div");
    root.className = "faq-item";

    var heading = document.createElement("h2");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "faq-question";
    button.id = "faq-q-" + faq.id;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "faq-a-" + faq.id);

    var cat = document.createElement("span");
    cat.className = "faq-category";
    cat.textContent = faq.category;
    var q = document.createElement("span");
    q.textContent = faq.question;
    button.appendChild(cat);
    button.appendChild(q);
    heading.appendChild(button);

    var answer = document.createElement("div");
    answer.className = "faq-answer";
    answer.id = "faq-a-" + faq.id;
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", button.id);
    answer.hidden = true;

    faq.answer.forEach(function (block) {
      if (block.type === "p") {
        var p = document.createElement("p");
        appendRichText(p, block.text);
        answer.appendChild(p);
      } else if (block.type === "ul") {
        var ul = document.createElement("ul");
        block.items.forEach(function (t) {
          var li = document.createElement("li");
          appendRichText(li, t);
          ul.appendChild(li);
        });
        answer.appendChild(ul);
      }
    });

    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      answer.hidden = expanded;
    });

    root.appendChild(heading);
    root.appendChild(answer);
    faqList.appendChild(root);

    return { faq: faq, root: root, searchText: buildSearchText(faq) };
  }

  function createCategoryButtons() {
    CATEGORIES.forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = name;
      b.setAttribute("aria-pressed", name === selectedCategory ? "true" : "false");
      b.addEventListener("click", function () {
        selectedCategory = name;
        categoryButtons.forEach(function (btn) {
          btn.setAttribute("aria-pressed", btn === b ? "true" : "false");
        });
        applyFilter();
      });
      categoryBox.appendChild(b);
      categoryButtons.push(b);
    });
  }

  function applyFilter() {
    var needle = query.trim().toLowerCase();
    var visible = 0;
    items.forEach(function (item) {
      var matchCategory = selectedCategory === ALL || item.faq.category === selectedCategory;
      var matchQuery = needle === "" || item.searchText.indexOf(needle) !== -1;
      var show = matchCategory && matchQuery;
      item.root.hidden = !show;
      if (show) {
        visible += 1;
      }
    });
    resultCount.textContent = visible + "件";
    emptyMessage.hidden = visible !== 0;
  }

  var THEME_KEY = "bob-faq-theme";
  var themeToggle = document.getElementById("theme-toggle");
  var currentTheme = "light";

  function readSavedTheme() {
    try {
      var saved = window.localStorage.getItem(THEME_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch (e) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // 保存できない環境でも動作を継続する
    }
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function initTheme() {
    var theme = readSavedTheme();
    if (theme === null) {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(theme);
    themeToggle.addEventListener("click", function () {
      var next = currentTheme === "dark" ? "light" : "dark";
      applyTheme(next);
      saveTheme(next);
    });
  }

  initTheme();
  createCategoryButtons();
  items = FAQ_DATA.map(createItem);
  searchInput.addEventListener("input", function () {
    query = searchInput.value;
    applyFilter();
  });
  applyFilter();
})();
