/* ========  themeSwitcher start ========= */

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  // Check saved theme in localStorage
  if (localStorage.getItem("theme") === "dark") {
    html.classList.add("dark");
  }

  // Toggle theme on button click
  themeToggle.addEventListener("click", () => {
    html.classList.toggle("dark");

    if (html.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
});
