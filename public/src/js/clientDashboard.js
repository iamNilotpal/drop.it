(function () {
  'use strict';

  const conatiner = document.querySelector('.container');

  /* ----------- User Functionality Sections --------------  */
  const mainContent = document.querySelector('.main-content');
  const dashboardContainerBtn = document.getElementById('dashboard-btn');
  const uploadContainerBtn = document.getElementById('upload-btn');
  const settingsContainerBtn = document.getElementById('settings-btn');

  /* ----------- URL--------------  */
  const BASE_URL = 'https://drop-drive.herokuapp.com';
  const LOGIN_URL = `${BASE_URL}/auth/login`;

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
    location.href = '/user/dashboard';
    preetifyEmail();
  });

  /* ----------- Upload Button Functionality --------------  */
  uploadContainerBtn.addEventListener('click', async () => {
    showLoadingAnimation();
    await authorizeUser(`${BASE_URL}/user/dashboard`, LOGIN_URL);
    replaceSearchUrl('upload', 'File upload path');

    const html = `
      <div class="upload-wrapper">
      <div class="center-container margin-big">
        <div class="welcome-message-box">
          <h1 class="welcome-message margin-micro">
            Take Your Files Everywhere,
            <span class="accent underline">safe</span>
          </h1>
          <div class="welcome-info">
            <h3 class="welcome-info-text">
              Drag and drop
              <span class="accent">images, videos, documents</span> or any
              kind of file.
            </h3>
          </div>
        </div>
      </div>

      <section class="upload-container">
        <form>
          <div class="drop-zone">
            <div class="icon-container">
              <i class="bx bx-file left"></i>
              <i class="bx bx-file center"></i>
              <i class="bx bx-file right"></i>
            </div>
            <input type="file" id="fileInput" name="file" />
            <h1 class="title">
              Drop your Files here or, <span id="browseBtn">browse</span>
            </h1>
          </div>
        </form>

        <div class="progress-container">
          <div class="inner-container">
            <p class="status">Uploading...</p>
            <div class="percent-container">
              <span class="percentage" id="progressPercent">0</span>%
            </div>
            <div class="progress-bar"></div>
          </div>
        </div>

        <div class="sharing-container">
          <p>Link expires in 24 hrs</p>
          <div class="input-container">
            <input type="text" id="fileURL" readonly/>
            <i class="bx bx-copy" id="copyURLBtn"></i>
          </div>

          <div class="email-container">
            <p class="email-info">Or Send via Email</p>
            <form id="emailForm">
              <div class="filed">
                <label for="toEmail">Receiver's Email</label>
                <input
                  type="email"
                  required
                  name="to-email"
                  id="toEmail"
                  autocomplete="off"
                  placeholder="Type Receiver's Email"
                />
              </div>
              <div class="send-btn-container">
                <button type="submit">Send</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
    `;
    mainContent.innerHTML = html;

    /* ----------- Upload Container --------------  */
    const dropZone = document.querySelector('.drop-zone');
    const fileInput = document.querySelector('#fileInput');
    const browseBtn = document.querySelector('#browseBtn');
    const progressPercent = document.querySelector('#progressPercent');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const status = document.querySelector('.status');
    const sharingContainer = document.querySelector('.sharing-container');
    const copyURLBtn = document.querySelector('#copyURLBtn');
    const fileURL = document.querySelector('#fileURL');
    const emailForm = document.querySelector('#emailForm');

    const UPLOAD_ENDPOINT = `${BASE_URL}/api/file/upload`;
    const EMAIL_ENDPOINT = `${BASE_URL}/api/file/mail`;
    const MAX_ALLOWED_SIZE = 100 * 1024 * 1024; /* ---- 100MB -----  */

    /* ----------- Listening For File Input --------------  */
    browseBtn.addEventListener('click', () => fileInput.click());
    mainContent.addEventListener('drop', (e) => e.preventDefault());
    document.body.addEventListener('drop', (e) => e.preventDefault());

    /* ----------- Listening For Drop Event --------------  */
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();

      const files = e.dataTransfer.files;
      /* ----------- Checking the file length --------------  */
      if (files.length === 1) {
        if (files[0].size < MAX_ALLOWED_SIZE) {
          fileInput.files = files;
          uploadFile();
        } else showToast('Max file size is 100MB');
      } else if (files.length > 1) showToast("You can't upload multiple files");

      dropZone.classList.remove('dragged');
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragged');
    });

    dropZone.addEventListener('dragleave', (e) => {
      dropZone.classList.remove('dragged');
    });

    /* ----------- Listening For Change Event -------------- */
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0].size > MAX_ALLOWED_SIZE) {
        showToast('Max file size is 100MB');
        fileInput.value = ''; /* ----- Reset input ------ */
        return;
      }

      if (fileInput.files.length > 1) {
        showToast("You can't upload multiple files");
        fileInput.value = ''; /* ----- Reset input ------ */
        return;
      }

      uploadFile();
    });

    /* ----------- Listening For Copy Button Click --------------  */
    copyURLBtn.addEventListener('click', () => {
      fileURL.select();
      document.execCommand('copy');
      showToast('Copied to clipboard.');
    });

    /* ----------- Listening For Url Select --------------  */
    fileURL.addEventListener('click', () => fileURL.select());

    /* ----------- Upload File Functionality --------------  */
    function uploadFile() {
      /* ----------- Getting The File And Creating Form Data--------------  */
      const files = fileInput.files;
      const formData = new FormData();
      formData.append('file', files[0]);

      /* ----------- show the uploader --------------  */
      progressContainer.style.display = 'flex';

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = function (event) {
        /* ----------- Percentage Of Upload --------------  */
        const percent = Math.round((100 * event.loaded) / event.total);
        progressPercent.innerText = percent;
        const scaleX = `scaleX(${percent / 100})`;
        progressBar.style.transform = scaleX;
      };

      /* ----------- Handling Error --------------  */
      xhr.upload.onerror = function () {
        showToast(`Opps! Error Uploading File.`);
        fileInput.value = ''; /* ----- Reset input ------ */
        xhr.abort();
      };

      /* ----------- Displaying The File Link --------------  */
      xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          progressBar.style.transform = 'scaleX(0)';
          onFileUploadSuccess(xhr.responseText);
        }
      };

      xhr.open('POST', UPLOAD_ENDPOINT);
      xhr.send(formData);
    }

    /* ----------- Displaying The File Link--------------  */
    function onFileUploadSuccess(res) {
      fileInput.value = '';
      status.innerText = 'Uploaded';

      /* ----------- remove the disabled attribute from form btn & make text send --------------  */
      emailForm[1].disabled = false;
      emailForm[1].innerText = 'Send';
      progressContainer.style.display = 'none'; // hide the box

      const response = JSON.parse(res);
      if (response.ok) {
        sharingContainer.style.display = 'block';
        fileURL.value = response.fileUrl;
      }
      showToast(response.message);
    }

    /* ----------- On Email Sent --------------  */
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      /* ----------- Disable Send Button --------------  */
      emailForm[1].disabled = true;
      emailForm[1].innerText = 'Sending Email';

      const url = fileURL.value;
      const formData = {
        uuid: url.split('/').splice(-1, 1)[0],
        emailTo: emailForm.elements['to-email'].value.trim(),
      };

      try {
        /* ----------- Fetch Request To Email Endpoint--------------  */
        const response = await fetch(EMAIL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }).then((res) => res.json());

        /* ----------- If Email Was Sent Successfully --------------  */
        if (response.ok) {
          emailForm[1].innerText = 'Email Sent';
          showToast(response.data);
          setTimeout(() => (sharingContainer.style.display = 'none'), 2000); // hide the box
        } else {
          showToast(response.message);
          emailForm[1].disabled = false;
          emailForm[1].innerText = 'Send Again';
        }
      } catch (error) {
        showToast(error.message);
      }
    });
  });

  /* ----------- Settings Button Funtionality --------------  */
  settingsContainerBtn.addEventListener('click', async () => {
    const SETTINGS_ENDPOINT = `${BASE_URL}/user/settings`;
    showLoadingAnimation();
    replaceSearchUrl('settings', 'User settings path');

    try {
      const authorizedResponse = await authorizeUser(
        SETTINGS_ENDPOINT,
        LOGIN_URL
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

          <div class="danger-zone upload-history-remove">
            <div class="title-settings">
            <h2>Clear Upload History</h2>
            </div>
            <p class="margin-small">Removing your upload history will deactive all the links and it cann't be undone.</p>
            <button class="btn--save" id="clear-history-btn">Yes, Clear My Upload History</button>
          </div>

          <div class="danger-zone logout-all">
          <div class="title-settings">
            <h2>Logout From All Devices?</h2>
          </div>
          <p class="margin-small">
            It will remove all of your session history and will log you out from all devices. 
          </p>
          <button class="btn--save" id="logout-all-btn">Yes, Logout From All Devices</button>
        </div>
        </div>
        </section>
        `;
          mainContent.innerHTML = html;

          /* ----------- Password Show And Hide Functionality --------------  */
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

          /* ----------- Change Information Form --------------  */
          const changeInfoForm = document.getElementById('change-info');
          const usernameEl = document.getElementById('username');
          const emailEl = document.getElementById('email');

          changeInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!usernameEl.value && !email.value) {
              showToast('Atleast one field is required.');
              return;
            }

            const CHANGE_INFO_FORM = `${BASE_URL}/user/change-info`;
            try {
              const responseInfo = await authorizeUserPost(
                CHANGE_INFO_FORM,
                {
                  username: usernameEl.value || '',
                  email: emailEl.value || '',
                },
                LOGIN_URL
              );

              if (responseInfo?.ok) {
                usernameEl.value = responseInfo.username;
                emailEl.value = responseInfo.email;
                showToast(responseInfo.message);
              } else {
                usernameEl.value = response.username;
                emailEl.value = response.email;
                showToast(responseInfo.message);
              }
            } catch (error) {
              showToast(error.message);
            }
          });

          /* ----------- Change Password Form --------------  */
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

            const CHANGE_PASSWORD_FORM = `${BASE_URL}/auth/change-password`;
            try {
              const response = await authorizeUserPost(
                CHANGE_PASSWORD_FORM,
                {
                  currentPassword: passwordsEls[0].value,
                  newPassword: passwordsEls[1].value,
                },
                LOGIN_URL
              );

              if (response) {
                showToast(response.message);
                passwordsEls[0].value = '';
                passwordsEls[1].value = '';
              }
            } catch (error) {
              showToast(error.message);
            }
          });

          /* ----------- Delete Account Functionality --------------  */
          const deleteAccountBtn =
            document.getElementById('delete-account-btn');

          deleteAccountBtn.addEventListener('click', async () => {
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.innerText = 'Deleting Account';

            const DELETE_ACCOUNT_URL = `${BASE_URL}/user/delete-account`;
            try {
              const authorizedResponse = await authorizeUser(
                DELETE_ACCOUNT_URL,
                LOGIN_URL,
                'DELETE'
              );

              if (authorizedResponse?.ok) {
                const response = await authorizedResponse.json();
                showToast(response.message);
                if (response.ok) {
                  deleteAccountBtn.innerText = 'Account Deleted';
                  setTimeout(
                    () => (location.href = response.redirectUrl),
                    2000
                  );
                } else {
                  deleteAccountBtn.innerText = 'Yes, Delete My Account';
                }
              }
            } catch (error) {
              showToast(error.message);
            }
          });

          /* ----------- Clear Uploads Button Functionality --------------  */
          const clearUploadsBtn = document.getElementById('clear-history-btn');

          clearUploadsBtn.addEventListener('click', async () => {
            clearUploadsBtn.innerText = 'Removing History';

            const REMOVE_HISTORY_URL = `${BASE_URL}/user/remove-history`;
            try {
              const authorizedResponse = await authorizeUser(
                REMOVE_HISTORY_URL,
                LOGIN_URL,
                'DELETE'
              );

              if (authorizedResponse?.ok) {
                const response = await authorizedResponse.json();
                showToast(response.message);
                clearUploadsBtn.innerText = 'Yes, Clear My Upload History';
              }
            } catch (error) {
              showToast(error.message);
            }
          });

          /* ----------- Logout From all Devices Button Functionality --------------  */
          const logoutAllBtn = document.getElementById('logout-all-btn');
          logoutAllBtn.addEventListener('click', async () => {
            logoutAllBtn.innerText = 'Logging Out';

            const LOGOUT_ALL = `${BASE_URL}/auth/logout-all`;
            try {
              const authorizedResponse = await authorizeUser(
                LOGOUT_ALL,
                LOGIN_URL,
                'DELETE'
              );

              if (authorizedResponse?.ok) {
                const response = await authorizedResponse.json();
                showToast(response.message);
                response.ok
                  ? (logoutAllBtn.innerText = 'Logged Out')
                  : (logoutAllBtn.innerText = 'Yes, Logout From All Devices');
                setTimeout(() => (location.href = LOGIN_URL), 1800);
              }
            } catch (error) {
              showToast(error.message);
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
    btnLogout.setAttribute('disabled', '');
    const LOGOUT_URL = `${BASE_URL}/auth/logout`;
    try {
      const authorizedResponse = await authorizeUser(
        LOGOUT_URL,
        LOGIN_URL,
        'DELETE'
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        showToast(response.message);
        setTimeout(() => (location.href = response.redirectUrl), 2000);
      }
    } catch (error) {
      showToast(error.message);
    }
  });

  /* ----------- Manage Images Functionality Section --------------  */
  const manageImagesSection = document.getElementById('manage-images-btn');
  manageImagesSection.addEventListener('click', async () => {
    showLoadingAnimation();
    replaceSearchUrl('get-images', 'Image history path');

    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/user/history/get-images`,
        LOGIN_URL
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
    replaceSearchUrl('get-videos', 'Videos hsitory path');

    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/user/history/get-videos`,
        LOGIN_URL
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

  /* ----------- Manage Documents Functionality Section --------------  */
  const manageDocumentsSection = document.getElementById('manage-others-btn');
  manageDocumentsSection.addEventListener('click', async () => {
    showLoadingAnimation();
    replaceSearchUrl('get-documents', 'Documents history path');

    try {
      const authorizedResponse = await authorizeUser(
        `${BASE_URL}/user/history/get-documents`,
        LOGIN_URL
      );

      if (authorizedResponse?.ok) {
        const response = await authorizedResponse.json();
        if (response.ok) {
          await renderManageFiles(response);

          /* ----------- Delete File Functionality --------------  */
          const trashIcons = document.querySelectorAll('.bxs-trash');
          trashIcons.forEach((trashIcon) =>
            trashIcon.addEventListener('click', (e) =>
              deleteAndRenderFiles(e, 'remove-document')
            )
          );
        } else showToast(response.message);
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

  /*  ----------------------------------------- UTILITY FUNCTIONS -----------------------------------------*/

  /* ----------- Pretifies The User Email ------------ */
  function preetifyEmail() {
    const email = document.getElementById('email');
    if (email && email.innerText.length > 30)
      email.innerText = email.innerText.slice(0, 30) + '...';
  }

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

  function replaceSearchUrl(path, info) {
    const queryPath = new URLSearchParams({ path }).toString();
    const state = {
      info,
      url: `${BASE_URL}/user/dashboard?${queryPath}`,
    };
    window.history.replaceState(state, '', state.url);
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
      `${BASE_URL}/user/history/${endpoint}`,
      { uuid },
      LOGIN_URL
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
      <section class="history-section">
      <div class="center-container margin-big">
        <div class="welcome-message-box--dark">
          <h1 class="welcome-message">
            Hey ${response.username}, You Haven't Uploaded Anything Yet.
          </h1>
          <div class="welcome-info">
            <h3 class="welcome-info-text">
              Try uploading something and informations will appear here.
            </h3>
          </div>
        </div>
      </div>

      <div class="history-wrapper--modified">
        <div class="history-illustration-box">
          <img
            class="history-illustration"
            src="/img/illustrations/nohistory.svg"
            alt="Illustration"
            draggable="false"
          />
        </div>
        <div class="history-box--modified">
          <h1>Oops! You haven't uploaded anything yet.</h1>
          <div class="history-modied-info">
            <p>
              Start by uploading something. Don't worry <span class="accent">Drop.it</span> stores all your important files in one secure
              location. Seamlessly share and collaborate with friends
              family, and co-workers.
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
              <p>Receiver</p>
              <p>${file.receiverInfo || 'Not Shared'}</p>
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
})();
