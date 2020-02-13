import './assets/scss/app.scss';
import $ from 'cash-dom';

const userNamePattern = new RegExp('^[a-z\\d-_]+$', 'i')
const gitBaseURL = 'https://api.github.com/users'
const eventTypes = [
  'PullRequestEvent',
  'PullRequestReviewCommentEvent',
]

export class App {
  initializeApp() {
    let self = this;
    $('.load-username').attr('disabled', true)

    $('.username.input').on('input', () => {
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

    $('.load-username').on('click', () => {
      $('#user-timeline').empty()
      let userName = $('.username.input').val().trim();
      const profileDataPromise = this.getUserData(userName)
      const eventsDataPromise = this.getUserEvents(userName)

      Promise.all([profileDataPromise, eventsDataPromise])
        .then(promisesValues => {
          this.profile = promisesValues[0];
          const eventsData = this.processEventsData(promisesValues[1])
          this.eventsData = eventsData
          this.renderEventsData()
          this.update_profile()
        });
    })
  }

  getUserData(userName) {
    return new Promise((resolve) => {
      fetch(`${gitBaseURL}/${userName}`)
        .then(response => resolve(response.json()))
    });
  }

  getUserEvents(userName) {
    return new Promise((resolve) => {
      fetch(`${gitBaseURL}/${userName}/events/public`)
        .then(response => resolve(response.json()))
    });
  }

  processEventsData(events) {
    const filteredEvents = events.filter(
      ev => eventTypes.indexOf(ev.type) > -1
    )
    return filteredEvents.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  }

  renderEventsData() {
    this.eventsData.forEach(eventData => {
      const { created_at, actor, payload, repo } = eventData
      $('#user-timeline').append(`
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <p class="heading">${created_at.substring(0, 10)}</p>
            <div class="content">
                  <span class="gh-username">
                    <img src="${actor.avatar_url}"/>
                    <a href="${payload.comment && payload.comment.user.html_url}">
                      ${actor.display_login}
                    </a>
                  </span>
              ${payload.action}
              <a href="${payload.pull_request.html_url}">pull request</a>
              <p class="repo-name">
                <a href="${payload.pull_request}">${repo.name}</a>
              </p>
            </div>
          </div>
        </div>
      `)
    })
  }

  update_profile() {
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', this.profile.avatar_url)
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login)
    $('#profile-bio').text(this.profile.bio || '(no information)')
  }
}
