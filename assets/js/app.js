/* Boya International Academy — v2 front-end
   原生 ES6，无依赖。模块：移动导航 / 粘性头部 / 滚动显现 / 图片灯箱 / 预约表单
*/
(function () {
  'use strict';

  /* ---------- 移动导航 ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 粘性头部阴影 ---------- */
  function initHeader() {
    var header = document.querySelector('.header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 滚动显现 ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 图片灯箱 ---------- */
  function initLightbox() {
    var lb = document.querySelector('.lightbox');
    if (!lb) return;
    var img = lb.querySelector('img');
    var cap = lb.querySelector('.lightbox__cap');
    var trigger = null;
    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      function open() {
        trigger = el;
        img.src = el.getAttribute('data-full') || el.src;
        img.alt = el.alt || '';
        cap.textContent = el.getAttribute('data-caption') || el.alt || '';
        lb.classList.add('is-open');
        lb.querySelector('.lightbox__close').focus();
      }
      el.addEventListener('click', open);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
    function close() {
      lb.classList.remove('is-open');
      img.src = '';
      if (trigger) { trigger.focus(); trigger = null; }
    }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lightbox__close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
    });
  }

  /* ---------- 预约表单 ---------- */
  function initForm() {
    var form = document.getElementById('visit-form');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    var t0 = Date.now();

    function showStatus(ok, msg) {
      status.textContent = msg;
      status.className = 'form-status ' + (ok ? 'is-ok' : 'is-err');
      status.setAttribute('role', ok ? 'status' : 'alert');
    }
    function fieldError(input, msg) {
      var field = input.closest('.field');
      if (!field) return;
      field.classList.toggle('has-error', Boolean(msg));
      var err = field.querySelector('.err');
      if (err && msg) err.textContent = msg;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // 前端基础校验
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var bad = !input.value.trim();
        fieldError(input, bad ? 'This field is required.' : '');
        if (bad && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data._t = t0; // 页面加载时间戳（服务端时间闸）

      btn.disabled = true;
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
        .then(function (res) {
          var j = res.body || {};
          if (j.ok) {
            showStatus(true, j.msg || 'Thank you. We will contact you shortly.');
            form.reset();
          } else {
            if (j.errors) {
              Object.keys(j.errors).forEach(function (name) {
                var input = form.querySelector('[name="' + name + '"]');
                if (input) fieldError(input, j.errors[name]);
              });
            }
            showStatus(false, j.msg || 'Submission failed. Please try again.');
          }
        })
        .catch(function () {
          showStatus(false, 'Network error. Please check your connection and try again.');
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  /* ---------- 页脚年份 ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHeader();
    initReveal();
    initLightbox();
    initForm();
    initYear();
  });
})();
