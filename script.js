/**
 * CapCut Tablet Classroom Interactive Script
 * High-performance, Accessible, Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM 요소 캐싱
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const sceneCards = document.querySelectorAll('.scene-card');
  const brandLink = document.getElementById('brand-link');

  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');

  const fontDecrease = document.getElementById('font-decrease');
  const fontIncrease = document.getElementById('font-increase');
  const fontLabel = document.getElementById('font-current-label');

  const scriptTriggers = document.querySelectorAll('[data-modal]');
  const scriptModals = document.querySelectorAll('.script-modal');
  const modalCloseBtns = document.querySelectorAll('[data-close]');

  const checkBoxes = document.querySelectorAll('.chk-box');
  const checkCountEl = document.getElementById('check-count');
  const checkPercentEl = document.getElementById('check-percentage');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const congratsCard = document.getElementById('checklist-congrats');

  /* ==========================================================================
     2. 상단 브랜드 링크 (클릭 시 최상단 부드러운 스크롤)
     ========================================================================== */
  brandLink?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ==========================================================================
     3. 테마 (라이트 / 다크 모드) 관리
     ========================================================================== */
  const savedTheme = localStorage.getItem('capcut_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme) {
    if (theme === 'dark') {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      if (themeIcon) themeIcon.textContent = '☀️';
      if (themeToggle) themeToggle.setAttribute('title', '라이트 모드로 전환');
    } else {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      if (themeIcon) themeIcon.textContent = '🌙';
      if (themeToggle) themeToggle.setAttribute('title', '다크 모드로 전환');
    }
    localStorage.setItem('capcut_theme', theme);
  }

  applyTheme(savedTheme);

  function toggleTheme() {
    const isDark = body.classList.contains('theme-dark');
    applyTheme(isDark ? 'light' : 'dark');
  }

  themeToggle?.addEventListener('click', toggleTheme);

  /* ==========================================================================
     4. 글자 크기 조절 (작게 / 보통 / 크게)
     ========================================================================== */
  const fontSizes = ['font-sm', 'font-md', 'font-lg'];
  const fontLabels = { 'font-sm': '작게', 'font-md': '보통', 'font-lg': '크게' };
  let currentFontIndex = 1; // 기본값 font-md

  const savedFont = localStorage.getItem('capcut_font_size');
  if (savedFont && fontSizes.includes(savedFont)) {
    currentFontIndex = fontSizes.indexOf(savedFont);
  }

  function applyFontSize(index) {
    fontSizes.forEach(cls => body.classList.remove(cls));
    const chosenClass = fontSizes[index];
    body.classList.add(chosenClass);
    if (fontLabel) fontLabel.textContent = fontLabels[chosenClass];
    localStorage.setItem('capcut_font_size', chosenClass);
  }

  applyFontSize(currentFontIndex);

  fontDecrease?.addEventListener('click', () => {
    if (currentFontIndex > 0) {
      currentFontIndex--;
      applyFontSize(currentFontIndex);
    }
  });

  fontIncrease?.addEventListener('click', () => {
    if (currentFontIndex < fontSizes.length - 1) {
      currentFontIndex++;
      applyFontSize(currentFontIndex);
    }
  });

  /* ==========================================================================
     5. 모바일 및 태블릿 반응형 사이드바 토글
     ========================================================================== */
  function openSidebar() {
    sidebar?.classList.add('open');
    sidebarOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  btnSidebarToggle?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  sidebarOverlay?.addEventListener('click', closeSidebar);

  // 사이드바 내부 링크 클릭 시 모바일/태블릿 세로 모드이면 사이드바 닫기
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        closeSidebar();
      }
    });
  });

  /* ==========================================================================
     6. 스크롤 스파이 (현재 보이는 장면 하이라이트)
     ========================================================================== */
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('data-target') === id) {
            link.classList.add('active');
            if (window.innerWidth > 1024) {
              link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sceneCards.forEach(card => sceneObserver.observe(card));

  /* ==========================================================================
     7. 교사용 강의 스크립트 모달 제어 및 장면별 대본 바로가기 연동
     ========================================================================== */
  function openModal(modalId, targetSectionId = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 특정 대본 섹션이 지정된 경우 해당 위치로 스크롤 및 하이라이트 펄스 애니메이션 부여
    if (targetSectionId) {
      const targetEl = modal.querySelector(`#${targetSectionId}`);
      const modalBody = modal.querySelector('.modal-body');

      if (targetEl && modalBody) {
        // 기존 하이라이트 클래스 제거
        modal.querySelectorAll('.highlight-pulse').forEach(el => el.classList.remove('highlight-pulse'));

        // 모달 렌더링 후 부드럽게 스크롤
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('highlight-pulse');

          // 3초 후 펄스 클래스 정리
          setTimeout(() => {
            targetEl.classList.remove('highlight-pulse');
          }, 3000);
        }, 150);
      }
    } else {
      // 상단 헤더 등에서 일반 전체 대본으로 열었을 때는 최상단으로 리셋
      const modalBody = modal.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // 모달 열기 트리거 (상단 헤더 버튼, 사이드바 버튼, 장면 카드별 바로가기 버튼)
  scriptTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      const targetSection = btn.getAttribute('data-section');
      if (modalId) {
        openModal(modalId, targetSection);
      }
    });
  });

  // 닫기 버튼 이벤트
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      closeModal(modal);
    });
  });

  // 모달 바깥 배경(딤 영역) 클릭 시 닫기
  scriptModals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // ESC 키로 모달 및 사이드바 닫기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      scriptModals.forEach(modal => {
        if (modal.classList.contains('active')) {
          closeModal(modal);
        }
      });
      if (sidebar?.classList.contains('open')) {
        closeSidebar();
      }
    }
  });

  /* ==========================================================================
     8. 인터랙티브 완성 체크리스트 (로컬 스토리지 연동)
     ========================================================================== */
  const CHECKLIST_STORAGE_KEY = 'capcut_student_checklist';
  let savedChecks = {};

  try {
    savedChecks = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY)) || {};
  } catch (err) {
    savedChecks = {};
  }

  function updateChecklistProgress() {
    const total = checkBoxes.length;
    if (total === 0) return;

    let checkedCount = 0;

    checkBoxes.forEach(box => {
      const parentLabel = box.closest('.check-item');
      if (box.checked) {
        checkedCount++;
        parentLabel?.classList.add('completed');
      } else {
        parentLabel?.classList.remove('completed');
      }
    });

    const percent = Math.round((checkedCount / total) * 100);

    if (checkCountEl) checkCountEl.textContent = checkedCount;
    if (checkPercentEl) checkPercentEl.textContent = `${percent}%`;
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;

    if (congratsCard) {
      if (checkedCount === total) {
        congratsCard.classList.remove('hidden');
      } else {
        congratsCard.classList.add('hidden');
      }
    }
  }

  // 초기 저장값 반영 및 변경 리스너 등록
  checkBoxes.forEach(box => {
    const id = box.getAttribute('data-id');
    if (id && savedChecks[id]) {
      box.checked = true;
    }

    box.addEventListener('change', () => {
      if (id) {
        savedChecks[id] = box.checked;
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(savedChecks));
      }
      updateChecklistProgress();
    });
  });

  // 초기 로드 시 체크리스트 진행률 갱신
  updateChecklistProgress();
});
