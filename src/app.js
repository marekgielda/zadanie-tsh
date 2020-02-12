import './assets/scss/app.scss';
import $ from 'cash-dom';

const userNamePattern = new RegExp('^[a-z\\d-_]+$', 'i');

export class App {
  initializeApp() {
    let self = this;
    $('.load-username').attr('disabled', true)

    $('.username.input').on('input', (e) => {
      const userName = $('.username.input').val().trim();
      const isUserNameValid = userNamePattern.test(userName)
      if (isUserNameValid) {
        $('.username.input').removeClass('is-danger')
        $('.load-username').removeAttr('disabled')
      } else {
        $('.username.input').addClass('is-danger')
        $('.load-username').attr('disabled', true)
      }
    })

    $('.load-username').on('click', function (e) {
      let userName = $('.username.input').val().trim();
      fetch('https://api.github.com/users/' + userName)
        .then(response => response.json())
        .then(function (body) {
          self.profile = body;
          self.update_profile();
        })

    })

  }

  update_profile() {
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', this.profile.avatar_url)
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login)
    $('#profile-bio').text(this.profile.bio || '(no information)')
  }
}
