(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();function c(a="/"){return`
    <header class="bg-white border-bottom shadow-sm sticky-top">
      <nav class="navbar navbar-expand-lg container py-2">
        <a class="navbar-brand fw-bold text-primary" href="#/">PropertyMarket</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-nav"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Превключване на навигацията"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="main-nav">
          <ul class="navbar-nav ms-auto gap-lg-2">${[{path:"/",label:"Начало"},{path:"/about",label:"За нас"},{path:"/listings",label:"Обяви"},{path:"/favorites",label:"Любими"},{path:"/profile",label:"Профил"},{path:"/admin",label:"Админ"},{path:"/login",label:"Вход"},{path:"/register",label:"Регистрация"}].map(({path:o,label:e})=>`
        <li class="nav-item">
          <a class="nav-link ${a===o?"active":""}" href="#${o}">${e}</a>
        </li>
      `).join("")}</ul>
        </div>
      </nav>
    </header>
  `}function i(){return`
    <footer class="border-top bg-white mt-5">
      <div class="container py-3 text-center text-muted small">
        © ${new Date().getFullYear()} PropertyMarket. Всички права запазени.
      </div>
    </footer>
  `}function d(){return`
    <section class="hero-section rounded-4 p-4 p-md-5 mb-4 bg-light border">
      <h1 class="display-6 fw-bold mb-3">Намерете следващия си дом с PropertyMarket</h1>
      <p class="lead text-secondary mb-4">
        Разгледайте апартаменти, къщи, вили и още имоти в удобна и модерна платформа.
      </p>
      <a href="#/listings" class="btn btn-primary btn-lg">Разгледай обявите</a>
    </section>

    <section aria-label="Препоръчани обяви">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h4 mb-0">Препоръчани имоти</h2>
        <a href="#/listings" class="link-primary text-decoration-none">Виж всички</a>
      </div>
      <div class="row g-3">
        ${n("Модерен апартамент","София","€145,000")}
        ${n("Семейна къща","Пловдив","€220,000")}
        ${n("Уютно студио","Варна","€95,000")}
      </div>
    </section>
  `}function n(a,t,s){return`
    <article class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <h3 class="h5 card-title mb-2">${a}</h3>
          <p class="mb-1 text-muted">${t}</p>
          <p class="fw-semibold mb-0">${s}</p>
        </div>
      </div>
    </article>
  `}function p(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">За нас</h1>
      <p class="mb-3 text-secondary">
        PropertyMarket е модерна платформа за покупка, продажба и отдаване под наем на жилищни имоти.
      </p>
      <p class="mb-3 text-secondary">
        Нашата мисия е да свързваме собственици, агенти и купувачи чрез ясни обяви, удобна навигация и надеждна информация.
      </p>
      <p class="mb-0 text-secondary">
        Работим за сигурно и приятно потребителско изживяване, за да откриете своя следващ дом по-лесно и по-бързо.
      </p>
    </section>
  `}function b(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Обяви за имоти</h1>
      <p class="mb-0 text-secondary">Тук ще се визуализират всички публикувани обяви.</p>
    </section>
  `}function m(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Детайли за имот</h1>
      <p class="mb-0 text-secondary">Подробна информация за избраната обява ще бъде налична тук.</p>
    </section>
  `}function u(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Вход</h1>
      <form class="row g-3" novalidate>
        <div class="col-12">
          <label for="email" class="form-label">Имейл</label>
          <input id="email" type="email" class="form-control" placeholder="Въведете имейл" />
        </div>
        <div class="col-12">
          <label for="password" class="form-label">Парола</label>
          <input id="password" type="password" class="form-control" placeholder="Въведете парола" />
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary">Влез</button>
        </div>
      </form>
    </section>
  `}function h(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Регистрация</h1>
      <form class="row g-3" novalidate>
        <div class="col-12">
          <label for="register-email" class="form-label">Имейл</label>
          <input id="register-email" type="email" class="form-control" placeholder="Въведете имейл" />
        </div>
        <div class="col-12">
          <label for="register-password" class="form-label">Парола</label>
          <input id="register-password" type="password" class="form-control" placeholder="Създайте парола" />
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary">Създай профил</button>
        </div>
      </form>
    </section>
  `}function f(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Създай обява</h1>
      <p class="mb-0 text-secondary">Формата за добавяне на нов имот ще бъде имплементирана тук.</p>
    </section>
  `}function g(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Редакция на обява</h1>
      <p class="mb-0 text-secondary">Формата за редакция на съществуващ имот ще бъде имплементирана тук.</p>
    </section>
  `}function y(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Профил</h1>
      <p class="mb-0 text-secondary">Информацията за потребителския профил ще бъде налична тук.</p>
    </section>
  `}function v(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Любими имоти</h1>
      <p class="mb-0 text-secondary">Тук ще се показват имотите, добавени в любими.</p>
    </section>
  `}function w(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Административен панел</h1>
      <p class="mb-0 text-secondary">Инструментите за управление на потребители и обяви ще бъдат тук.</p>
    </section>
  `}function P(a,t){a.innerHTML=t}const x={"/":d,"/about":p,"/listings":b,"/property":m,"/login":u,"/register":h,"/create-property":f,"/edit-property":g,"/profile":y,"/favorites":v,"/admin":w};function $(){const a=document.getElementById("app");if(!a)throw new Error("Основният контейнер на приложението не е намерен.");const t=()=>{const s=window.location.hash.replace("#","")||"/",o=x[s]||L;P(a,`${c(s)}
      <main class="container py-4">${o()}</main>
      ${i()}`)};window.addEventListener("hashchange",t),t()}function L(){return`
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Страницата не е намерена</h1>
      <p class="mb-3 text-secondary">Моля, върнете се към началната страница.</p>
      <a href="#/" class="btn btn-primary">Към начало</a>
    </section>
  `}$();
