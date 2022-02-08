(function () {
  'use strict';

  window.addEventListener('load', (e) => {
    const emails = document.querySelectorAll('.email-address');
    emails.forEach((email) => {
      const data = preetifyEmail(email);
      if (data) email.innerText = data;
    });

    const fileSizes = document.querySelectorAll('.file-size');
    fileSizes.forEach((file) => (file.innerText = formatBytes(file.innerText)));
  });

  const conatiner = document.querySelector('.container');

  /* ----------- User Functionality Containers --------------  */
  const mainContent = document.querySelector('.main-content');
  const dashboardContainerBtn = document.getElementById('dashboard-btn');
  const settingsContainerBtn = document.getElementById('settings-btn');

  /* ----------- URLS --------------  */
  const BASE_URL = 'https://drop-drive.herokuapp.com';
  const LOGOUT_URL = `${BASE_URL}/admin/auth/login`;

  /* ----------- Navigation Buttons Functionality --------------  */
  const navigationLinks = document.querySelectorAll('.nav-link');
  navigationLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (
        !e.target.classList.contains('accent-bg') &&
        !e.target.parentNode.classList.contains('accent-bg')
      ) {
        navigationLinks.forEach((sideLink) =>
          sideLink.classList.remove('accent-bg')
        );
        link.classList.add('accent-bg');
      }
    });
  });

  /* ----------- Dashboard Button Functionality --------------  */
  dashboardContainerBtn.addEventListener('click', () => {
    showLoadingAnimation();
    location.href = '/admin/dashboard';

    const emails = document.querySelectorAll('.email-address');
    emails.forEach((email) => {
      const data = preetifyEmail(email);
      if (data) email.innerText = data;
    });

    const fileFizes = document.querySelectorAll('.file-size');
    fileFizes.forEach((fileSize) => {
      const data = formatBytes(fileSize.innerText);
      if (data) fileSize.innerText = data;
    });

    const fileSizes = document.querySelectorAll('.file-size');
    fileSizes.forEach((file) => (file.innerText = formatBytes(file.innerText)));
  });

  /* -------------------- Settings Button Funtionality -----------------------  */
  settingsContainerBtn.addEventListener('click', async () => {
    const SETTINGS_ENDPOINT = `${BASE_URL}/admin/settings`;
    showLoadingAnimation();

    try {
      const authorizedResponse = await authorizeUser(
        SETTINGS_ENDPOINT,
        LOGOUT_URL
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        if (response.ok) {
          const html = `
            <section class="settings-section">
              <div class="center-container margin-extra-big">
                <div class="welcome-message-box welcome-message-box--dark">
                  <h1 class="welcome-message">
                    ${response.username}, Manage Your Acount Settings.
                  </h1>
                  <div class="welcome-info">
                    <h3 class="welcome-info-text">
                      You can manage and update your account settings from here.
                    </h3>
                  </div>
                </div>
              </div>
      
            <div class="personal-information">
              <div class="title-settings">
                <h2>Personal Informations</h2>
              </div>
              <form id="change-info">
                <div class="update-box">
                  <label for="username">Username</label>
                  <input type="text" id="username" value="${response.username}" autocomplete="off"/>
                </div>
      
                <div class="update-box">
                  <label for="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value="${response.email}"
                    autocomplete="off"
                  />
                </div>
                <button class="btn--save">Save Changes</button>
              </form>
            </div>
      
            <div class="password-information">
              <div class="title-settings">
                <h2>Password Settings</h2>
              </div>
              <form id="change-password">
                <div class="update-box">
                  <label for="password">Current Password</label>
                  <div class="input-box">
                    <input
                      type="password"
                      id="password"
                      autocomplete="off"
                    />
                    <i class="bx bx-show"></i>
                  </div>
                </div>
      
                <div class="update-box">
                  <label for="new-password">New Password</label>
                  <div class="input-box">
                    <input
                      type="password"
                      id="new-password"
                      autocomplete="off"
                      />
                    <i class="bx bx-show"></i>
                    </div>
                </div>
                <button class="btn--save" id="change-password-btn">Change Password</button>
              </form>
            </div>
      
            <div class="danger-zone">
              <div class="title-settings">
                <h2>Delete Account</h2>
              </div>
              <p>Deleting your account?</p>
              <p class="margin-medium">
                Deleting your account will remove all the content associated with
                it and it can't be undone.
              </p>
              <button class="btn--save" id="delete-account-btn">Yes, Delete My Account</button>
            </div>
          </div>
          </section>
          `;
          mainContent.innerHTML = html;

          /* -------------------- Password Hide And Show Buttons -----------------------  */
          const showBtn = document.querySelectorAll('.bx-show');
          const passwordsEls = document.querySelectorAll('.input-box input');

          passwordsEls.forEach((el) => {
            el.addEventListener('input', (e) => {
              e.stopImmediatePropagation();
              if (e.target.value.length < 1) {
                e.target.nextElementSibling.style.display = 'none';
                return;
              }
              e.target.nextElementSibling.style.display = 'block';
            });
          });

          showBtn.forEach((btn) =>
            btn.addEventListener('click', (e) => {
              e.stopImmediatePropagation();
              showHidePassword(btn, e.target.previousElementSibling);
            })
          );

          /* ----------- Change Information Button Functionality --------------  */
          const changeInfoForm = document.getElementById('change-info');
          const usernameEl = document.getElementById('username');
          const emailEl = document.getElementById('email');

          changeInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!usernameEl.value && !email.value) {
              showToast('Atleast one field is required.');
              return;
            }

            try {
              const responseInfo = await authorizeUserPost(
                `${BASE_URL}/admin/change-info`,
                {
                  username: usernameEl.value || '',
                  email: emailEl.value || '',
                },
                LOGOUT_URL
              );

              if (responseInfo) {
                if (responseInfo.ok) {
                  usernameEl.value = responseInfo.username;
                  emailEl.value = responseInfo.email;
                } else {
                  usernameEl.value = response.username;
                  emailEl.value = response.email;
                }
                showToast(responseInfo.message);
              }
            } catch (error) {
              showToast(error.message);
            }
          });

          /* ----------- Change Password Functionality --------------  */
          const changePasswordForm = document.getElementById('change-password');
          changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!passwordsEls[0].value || !passwordsEls[1].value) {
              showToast('All password fields are required.');
              return;
            }

            if (passwordsEls[1].value.length < 5) {
              showToast('New password should be at least 5 characters long.');
              return;
            }

            if (passwordsEls[0].value === passwordsEls[1].value) {
              showToast('New password must be different.');
              return;
            }

            try {
              const response = await authorizeUserPost(
                `${BASE_URL}/admin/change-password`,
                {
                  currentPassword: passwordsEls[0].value,
                  newPassword: passwordsEls[1].value,
                },
                LOGOUT_URL
              );
              if (response) showToast(response.message);
            } catch (error) {
              showToast(error.message);
            }
            passwordsEls[0].value = '';
            passwordsEls[1].value = '';
          });

          /* ----------- Delete Account Button Functionality --------------  */
          const deleteAccountBtn =
            document.getElementById('delete-account-btn');

          deleteAccountBtn.addEventListener('click', async () => {
            deleteAccountBtn.innerText = 'Deleting Account';
            const responseInfo = await authorizeUser(
              `${BASE_URL}/admin/delete-account`,
              LOGOUT_URL,
              'DELETE'
            );

            if (responseInfo) {
              const response = await responseInfo.json();
              showToast(response.message);

              if (response.ok) {
                deleteAccountBtn.innerText = 'Account Deleted';
                setTimeout(() => (location.href = response.redirectUrl), 2000);
              } else deleteAccountBtn.innerText = 'Yes, Delete My Account';
            }
          });
        } else showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  /* ----------- Logout Button Functionality --------------  */
  const btnLogout = document.getElementById('btn-logout');
  const btnCancelLogout = document.getElementById('btn-cancel');

  btnCancelLogout.addEventListener('click', () => closeModal());
  btnLogout.addEventListener('click', async () => {
    try {
      btnLogout.setAttribute('disabled', '');
      const responseInfo = await authorizeUser(
        `${BASE_URL}/admin/auth/logout`,
        LOGOUT_URL,
        'DELETE'
      );

      if (responseInfo?.ok) {
        const response = await responseInfo.json();
        showToast(response.message);
        setTimeout(() => (location.href = response.redirectUrl), 1800);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  /* ----------- Open Modal Button Functionality --------------  */
  const modalWrapper = document.querySelector('.modal__wrapper');
  const logoutBtnContainer_1 = document.querySelector('.bx-log-out');
  const logoutBtnContainer_2 = document.querySelector('.logout-text');

  logoutBtnContainer_1.addEventListener('click', () => openModal());
  logoutBtnContainer_2.addEventListener('click', () => openModal());

  modalWrapper.addEventListener('click', function (e) {
    if (e.target !== this) return;
    closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  function openModal() {
    modalWrapper.classList.add('active');
  }

  function closeModal() {
    modalWrapper.classList.remove('active');
  }

  /* ----------- Manage Admins Functionality Section --------------  */
  const manageAdminsSection = document.getElementById('manage-admins-btn');
  manageAdminsSection.addEventListener('click', async () => {
    showLoadingAnimation();
    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/admin/get-admins`,
        LOGOUT_URL
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        if (response.ok) {
          renderAdminsPage(response);

          /* ----------- Delete Admin Account Functionality --------------  */
          const trashIcons = document.querySelectorAll('.bx-user-x');
          trashIcons.forEach((trashIcon) =>
            trashIcon.addEventListener('click', deleteAndRenderAdmins)
          );

          /* ----------- Add Admin Account Functionality --------------  */
          const addAdminForm = document.getElementById('add-admin');
          addAdminForm.addEventListener('submit', addAdmin);
        } else showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  async function addAdmin(e) {
    try {
      e.preventDefault();

      const email = e.target.elements.email.value;
      const username = e.target.elements.username.value;
      const password = e.target.elements.password.value;

      if (!username || !email || !password) {
        return showToast('All fields are required.');
      }

      if (username !== username.toLowerCase()) {
        showToast('Username must be in Lowercase.');
        return;
      }

      if (email !== email.toLowerCase()) {
        showToast('Email must be in Lowercase.');
        return;
      }

      const response = await authorizeUserPost(`${BASE_URL}/admin/add-admin`, {
        username,
        email,
        password,
        LOGOUT_URL,
      });

      if (response) showToast(response.message);
      if (response?.ok) {
        renderAdminsPage(response);
        /* ----------- Delete Admin Account Functionality --------------  */
        const trashIcons = document.querySelectorAll('.bx-user-x');
        trashIcons.forEach((trashIcon) =>
          trashIcon.addEventListener('click', deleteAndRenderAdmins)
        );
      }
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ----------- Manage Images Functionality Section --------------  */
  const manageImagesSection = document.getElementById('manage-images-btn');
  manageImagesSection.addEventListener('click', async () => {
    showLoadingAnimation();
    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/admin/get-images`,
        LOGOUT_URL
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        if (response.ok) {
          await renderManageFiles(response);

          /* ----------- Delete File Functionality --------------  */
          const trashIcons = document.querySelectorAll('.bxs-trash');
          trashIcons.forEach((trashIcon) =>
            trashIcon.addEventListener('click', (e) =>
              deleteAndRenderFiles(e, 'remove-image')
            )
          );
        } else showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  /* ----------- Manage Videos Functionality Section --------------  */
  const manageVideosSection = document.getElementById('manage-videos-btn');
  manageVideosSection.addEventListener('click', async () => {
    showLoadingAnimation();

    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/admin/get-videos`,
        LOGOUT_URL
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        if (response.ok) {
          await renderManageFiles(response);

          /* ----------- Delete File Functionality --------------  */
          const trashIcons = document.querySelectorAll('.bxs-trash');
          trashIcons.forEach((trashIcon) =>
            trashIcon.addEventListener('click', (e) =>
              deleteAndRenderFiles(e, 'remove-video')
            )
          );
        } else showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  /* ----------- Manage Others Functionality Section --------------  */
  const manageOthersSection = document.getElementById('manage-others-btn');
  manageOthersSection.addEventListener('click', async () => {
    showLoadingAnimation();
    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/admin/get-others`,
        LOGOUT_URL
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        if (response.ok) {
          await renderManageFiles(response);

          /* ----------- Delete File Functionality --------------  */
          const trashIcons = document.querySelectorAll('.bxs-trash');
          trashIcons.forEach((trashIcon) =>
            trashIcon.addEventListener('click', (e) =>
              deleteAndRenderFiles(e, 'remove-other')
            )
          );
        } else showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  /* ----------- Manage Users Functionality --------------  */
  const manageUsersSection = document.getElementById('manage-users-btn');
  manageUsersSection.addEventListener('click', async () => {
    showLoadingAnimation();
    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/admin/get-users`,
        LOGOUT_URL
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        if (response.ok) {
          renderManageUsers(response);

          /*  ------------ Delete User ----------- */
          const trashIcons = document.querySelectorAll('.bx-user-x');
          trashIcons.forEach((trashIcon) =>
            trashIcon.addEventListener('click', deleteAndRenderUsers)
          );
        } else showToast(response.message);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  /*  ------------------- UTILITY FUNCTIONS ------------------ */
  /* ----------- Inserts Loading Animation ------------ */
  function showLoadingAnimation() {
    const html = `
      <!-- CSS Loading Animation -->
      <svg width="300" height="120" id="clackers">
        <!-- Left arc path -->
        <svg>
          <path id="arc-left-up" fill="none" d="M 90 90 A 90 90 0 0 1 0 0" />
        </svg>
        <!-- Right arc path -->
        <svg>
          <path id="arc-right-up" fill="none" d="M 100 90 A 90 90 0 0 0 190 0" />
        </svg>
    
        <text
          x="150"
          y="50"
          fill="#ffffff"
          font-family="Helvetica Neue,Helvetica,Arial"
          font-size="18"
          text-anchor="middle"
        >
          L O A D I N G
        </text>
        <circle cx="15" cy="15" r="15">
          <!-- I used a python script to calculate the keyPoints and keyTimes based on a quadratic function. -->
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            calcMode="linear"
            keyPoints="0.0;0.19;0.36;0.51;0.64;0.75;0.84;0.91;0.96;0.99;1.0;0.99;0.96;0.91;0.84;0.75;0.64;0.51;0.36;0.19;0.0;0.0;0.05;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0"
            keyTimes="0.0;0.025;0.05;0.075;0.1;0.125;0.15;0.175;0.2;0.225;0.25;0.275;0.3;0.325;0.35;0.375;0.4;0.425;0.45;0.475;0.5;0.525;0.55;0.575;0.6;0.625;0.65;0.675;0.7;0.725;0.75;0.775;0.8;0.825;0.85;0.875;0.9;0.925;0.95;0.975;1.0"
          >
            <mpath xlink:href="#arc-left-up" />
          </animateMotion>
        </circle>
        <circle cx="135" cy="105" r="15" />
        <circle cx="165" cy="105" r="15" />
        <circle cx="95" cy="15" r="15">
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            calcMode="linear"
            keyPoints="0.0;0.0;0.05;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0.0;0.19;0.36;0.51;0.64;0.75;0.84;0.91;0.96;0.99;1.0;0.99;0.96;0.91;0.84;0.75;0.64;0.51;0.36;0.19;0.0"
            keyTimes="0.0;0.025;0.05;0.075;0.1;0.125;0.15;0.175;0.2;0.225;0.25;0.275;0.3;0.325;0.35;0.375;0.4;0.425;0.45;0.475;0.5;0.525;0.55;0.575;0.6;0.625;0.65;0.675;0.7;0.725;0.75;0.775;0.8;0.825;0.85;0.875;0.9;0.925;0.95;0.975;1.0"
          >
            <mpath xlink:href="#arc-right-up" />
          </animateMotion>
        </circle>
      </svg>
      `;
    mainContent.innerHTML = html;
  }

  /* ----------- Sammler Email Address ------------ */
  function preetifyEmail(elem) {
    if (elem && elem.innerText.length > 25)
      return (elem.innerText = elem.innerText.slice(0, 25) + '...');
  }

  /* ----------- Displays Toast Messages ------------ */
  function showToast(msg) {
    const toasts = document.querySelectorAll('.toast');
    if (toasts) {
      toasts.forEach((toast) => toast.remove());
    }

    const div = document.createElement('div');
    div.innerText = msg;
    div.classList.add('toast');
    div.classList.add('show');

    conatiner.insertAdjacentElement('beforeend', div);
    setTimeout(() => {
      div.remove();
    }, 2000);
  }

  /* -----------  Formatting The Size Of The File -----------  */
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const kbToByte = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const size = Math.floor(Math.log(bytes) / Math.log(kbToByte));
    return (
      parseFloat((bytes / Math.pow(kbToByte, size)).toFixed(2)) +
      ' ' +
      sizes[size]
    );
  }

  /* ----------- Get Smaller File Name -----------  */
  function getSmallFileName(filename, size = 25) {
    if (filename.length > size) {
      const length = filename.length;
      return `${filename.slice(0, size)}...${filename.slice(
        length - 10,
        length
      )}`;
    }
    return filename;
  }

  /* -----------  Password Show Hide Funtionality -----------  */
  function showHidePassword(btn, item) {
    if (btn.style.display === 'block') {
      if (item.type === 'password') {
        item.type = 'text';
        btn.classList.remove('bx-show');
        btn.classList.add('bx-hide');
      } else {
        item.type = 'password';
        btn.classList.remove('bx-hide');
        btn.classList.add('bx-show');
      }
    }
  }

  /* -----------  Authorize User -----------  */
  async function authorizeUser(
    url,
    redirectUrl = '/auth/login',
    method = 'GET'
  ) {
    const response = await fetch(url, { method });
    if (response.status === 401) {
      showToast("Your're unauthorized to access this route.");
      return setTimeout(() => (location.href = redirectUrl), 2000);
    }
    return response;
  }

  /* -----------  Authorize User Post Request -----------  */
  async function authorizeUserPost(url, body, redirectUrl = '/auth/login') {
    try {
      const authorizedResponse = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (authorizedResponse.status === 401) {
        showToast("Your're unauthorized to access this route.");
        return setTimeout(() => (location.href = redirectUrl), 2000);
      }

      return authorizedResponse.json();
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ----------- Render Functionality Manage Files Section --------------  */
  async function deleteAndRenderFiles(e, endpoint) {
    const parentNode = e.target.parentNode.parentNode;
    const uuid = parentNode.children[0].children[1].innerText;
    const response = await authorizeUserPost(
      `${BASE_URL}/admin/${endpoint}`,
      { uuid },
      LOGOUT_URL
    );

    if (response) showToast('File Removed.');
    if (response?.ok) {
      renderManageFiles(response);
      const trashIcons = document.querySelectorAll('.bxs-trash');
      trashIcons.forEach((trashIcon) =>
        trashIcon.addEventListener('click', (e) =>
          deleteAndRenderFiles(e, endpoint)
        )
      );
    }
  }

  async function renderManageFiles(response) {
    if (response.files.length === 0) {
      const html = `
      <section class="files-history-section">
        <div class="center-container margin-medium">
          <div class="welcome-message-box">
            <h1 class="welcome-message">
              No Active Files Yet.
            </h1>
            <div class="welcome-info">
              <h3 class="welcome-info-text">
                File information will include file size, uploader email, download link etc. 
              </h3>
            </div>
          </div>
        </div>

        <div class="files-wrapper--modified">
          <div class="files-illustration-box">
            <img class="files-illustration" src="/img/illustrations/nohistory2.svg" alt="Illustration"
              draggable="false" />
          </div>
          <div class="files-box--modified">
            <h1>Nothing Has Been Uploaded Yet. Wait For Someone To Upload.</h1>
            <div class="files-modified-info">
              <p>
                  Files that are older than 5 Hours will be automatically deleted and will not show up in history. To look other files history click on their dedicated tab.
              </p>
            </div>
          </div>
      </section>
      `;
      mainContent.innerHTML = html;
    } else {
      const div = document.createElement('div');
      let totalSize = 0;
      let totalEmails = 0;
      response.files.forEach((file) => {
        totalSize += file.fileSize;
        totalEmails += file.receiverInfo ? 1 : 0;

        const html = document.createElement('div');
        html.innerHTML = `
        <div class="file-history-box">
          <div class="file-details">
            <div class="file-details--box uuid">
              <p>UUID</p>
              <p>${file.uuid}</p> 
            </div>
      
            <div class="file-details--box">
              <p>File Size</p>
              <p>${formatBytes(file.fileSize)}</p>
            </div>
        
            <div class="file-details--box">
              <p>Uploader</p>
              <p>${file.uploaderInfo.email}</p>
            </div>

            <div class="file-details--box">
              <p>Uploaded Time</p>
              <p>${new Date(file.createdAt).toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}</p>
            </div>

            <div class="file-details--box download">
              <p>Download</p>
              <p>
              <a href="${BASE_URL}/uploads/file/${file.uuid}" target="_blank">
                <i class='bx bx-download'></i>
              </a>
              </p>
            </div>

            <div class="file-details--box trash">
              <p>Delete File</p>
              <i class='bx bxs-trash'></i>
            </div>
          </div>
        </div>`;
        div.appendChild(html);
      });

      const html = `
      <section class="files-history-section">
        <div class="information-box"> 
          <div class="information">
            <p>Active Files</p>
            <h1>${response.files.length}</h1>
          </div>

          <div class="information">
            <p>Emails Sent</p>
            <h1>
              ${totalEmails}
            </h1>
          </div>

          <div class="information">
            <p>Total Storage</p>
            <h1>
              ${formatBytes(totalSize)}
            </h1>
          </div>
        </div>

        <div class="files-wrapper">
          ${div.innerHTML}
        </div>
      </section>
      `;
      mainContent.innerHTML = html;
    }
  }

  /* ----------- Render Functionality Manage Users Section --------------  */
  async function deleteAndRenderUsers(e) {
    const parentNode = e.target.parentNode.parentNode;
    const email = parentNode.children[1].children[1].innerText;
    const response = await authorizeUserPost(
      `${BASE_URL}/admin/remove-user`,
      { email },
      LOGOUT_URL
    );

    if (response) showToast(response.message);
    if (response?.ok) {
      renderManageUsers(response);
      const trashIcons = document.querySelectorAll('.bx-user-x');
      trashIcons.forEach((trashIcon) =>
        trashIcon.addEventListener('click', deleteAndRenderUsers)
      );
    }
  }

  function renderManageUsers(response) {
    if (response.users.length === 0) {
      const html = `
      <section class="users-history-section">
        <div class="center-container margin-medium">
          <div class="welcome-message-box">
            <h1 class="welcome-message">
              No Active Users Yet.
            </h1>
            <div class="welcome-info">
              <h3 class="welcome-info-text">
                Only users infomation will appear here. Deleting user account will delete all its content.
              </h3>
            </div>
          </div>
        </div>

        <div class="users-wrapper--modified">
          <div class="users-illustration-box">
            <img class="users-illustration" src="/img/illustrations/nohistory2.svg" alt="Illustration"
              draggable="false" />
          </div>
          <div class="users-box--modified">
            <h1>No active users yet. Create an account for Demo.</h1>
            <div class="users-modified-info">
              <p>
                Only users infomation will appear here. User information includes username, email, account creation date, total uploaded files etc.
              </p>
            </div>
          </div>
      </section>
      `;
      mainContent.innerHTML = html;
    } else {
      const div = document.createElement('div');
      let totalStorage = 0;
      let totalFilesUploaded = 0;

      response.users.forEach((user) => {
        totalStorage += user.activeStorage;
        totalFilesUploaded += user.activeFiles;

        const html = document.createElement('div');
        html.innerHTML = `
        <div class="file-history-box">
          <div class="userinfo-details">
            <div class="user-details--box">
              <p>Username</p>
              <p>${user.username}</p>
            </div>

            <div class="user-details--box">
              <p>Email Address</p>
              <p>${user.email.address}</p>
            </div>
        
            <div class="user-details--box">
              <p>Active Files</p>
              <p>${user.activeFiles}</p>
            </div>
            
            <div class="user-details--box">
              <p>Active Storage</p>
              <p>${formatBytes(user.activeStorage)}</p> 
            </div>

            <div class="user-details--box">
              <p>Created At</p>
              <p>${new Date(user.createdAt).toDateString()}</p>
            </div>

            <div class="user-details--box trash">
              <p>Remove</p>
              <i class='bx bx-user-x' id="bx-user-x"></i>
            </div>
          </div>
        </div>`;
        div.appendChild(html);
      });

      const html = `
      <section class="users-history-section">
        <div class="information-box"> 
          <div class="information">
            <p>Active Users</p>
            <h1>${response.users.length}</h1>
          </div>

          <div class="information">
            <p>Uploaded Files</p>
            <h1>${totalFilesUploaded}</h1>
          </div>

          <div class="information">
            <p>Total Storage</p>
            <h1>
              ${formatBytes(totalStorage)}
            </h1>
          </div>
        </div>

        <div class="users-wrapper">
          ${div.innerHTML}
        </div>
      </section>
      `;
      mainContent.innerHTML = html;
    }
  }

  /* ----------- Render Functionality Admins Section --------------  */
  async function deleteAndRenderAdmins(e) {
    const parentNode = e.target.parentNode.parentNode;
    const email = parentNode.children[1].children[1].innerText;

    const response = await authorizeUserPost(
      `${BASE_URL}/admin/remove-admin`,
      { email },
      LOGOUT_URL
    );

    if (response) showToast(response.message);
    if (response?.ok) {
      renderAdminsPage(response);
      const trashIcons = document.querySelectorAll('.bxs-trash');
      trashIcons.forEach((trashIcon) =>
        trashIcon.addEventListener('click', deleteAndRenderAdmins)
      );
    }
  }

  function renderAdminsPage(response) {
    if (response.admins.length === 0) {
      const html = `
      <section class="users-history-section">
        <div class="center-container margin-medium">
          <div class="welcome-message-box">
            <h1 class="welcome-message">
              No Active Admins Yet.
            </h1>
            <div class="welcome-info">
              <h3 class="welcome-info-text">
                Only admins infomation will appear here except yours. 
              </h3>
            </div>
          </div>
        </div>

        <div class="users-wrapper--modified">
          <div class="users-illustration-box">
            <img class="users-illustration" src="/img/illustrations/nohistory2.svg" alt="Illustration"
              draggable="false" />
          </div>
          <div class="users-box--modified">
            <h1>No Active Admins Yet.</h1>
            <div class="users-modified-info">
              <p>
                Admin information includes username, email, account creation date. Note that you can remove other admins but not Super Admins.
              </p>
            </div>
          </div>
      </section>
      `;
      mainContent.innerHTML = html;
    } else {
      const div = document.createElement('div');
      let superAdmins = 0;

      response.admins.forEach((admin) => {
        const html = document.createElement('div');
        superAdmins += admin.isSuperAdmin ? 1 : 0;

        html.innerHTML = `
        <div class="file-history-box">
          <div class="userinfo-details">
            <div class="user-details--box">
              <p>Username</p>
              <p>${admin.username}</p>
            </div>

            <div class="user-details--box">
              <p>Email Address</p>
              <p>${admin.email.address}</p>
            </div>
        
            <div class="user-details--box">
              <p>Super Admin</p>
              <p>${admin.isSuperAdmin ? 'Yes' : 'No'}</p>
            </div>

            <div class="user-details--box">
              <p>Created At</p>
              <p>${new Date(admin.createdAt).toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}</p>
            </div>

            <div class="user-details--box trash">
              <p>Remove</p>
              <i class='bx bx-user-x' id="bx-user-x"></i>
            </div>
          </div>
        </div>`;
        div.appendChild(html);
      });

      const html = `
      <section class="users-history-section">
        <div class="information-box admins-box"> 
          <div class="information">
            <p>Active Admins</p>
            <h1>${response.admins.length - superAdmins}</h1>
          </div>

          <div class="information">
            <p>Super Admins</p>
            <h1>${superAdmins}</h1>
          </div>
        </div>

        <div class="personal-information admin-add-information">
          <div class="title-settings">
            <h2>CREATE ADMIN ACCOUNT</h2>
          </div>
          <form id="add-admin">
            <div class="update-box">
              <label for="username">Username</label>
              <input type="text" id="username" autocomplete="off"/>
            </div>

            <div class="update-box">
              <label for="email">Email Address</label>
              <input
                type="email"
                id="email"
                autocomplete="off"
              />
            </div>
          
            <div class="update-box">
              <label for="password">Password</label>
              <div class="input-box">
                <input
                  type="password"
                  id="password"
                  autocomplete="off"
                  />
                <i class="bx bx-show"></i>
                </div>
            </div>
            <button type="submit" class="btn--save" id="add-admin-btn">Add Admin</button>
          </form>
        </div>

        <div class="users-wrapper">
          ${div.innerHTML}
        </div>
      </section>
      `;
      mainContent.innerHTML = html;
    }
  }
})();
