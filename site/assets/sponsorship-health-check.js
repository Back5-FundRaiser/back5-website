/* Sponsorship health check: the areas, questions, advice and wording.
   Every question has four answers, ordered from weakest (0 points) to
   strongest (3 points). `fix` is the advice shown when the answer is weak.
   Edit the wording here; the scoring and layout live in health-check.js. */
(function () {
  var HELP = { name: 'Grassroots Connector', href: '/for-brands/', text: 'One program across many clubs, with consent from the families you reach and reporting on what happened.' };
  window.B5_CHECK = {
    intro: 'Six areas, two questions each. About three minutes, and you get a scorecard that says what to fix first.',
    headline: {
      low: 'Your sport sponsorship is buying goodwill and not much else. Most of its value is still on the table.',
      mid: 'Your sponsorship does some work, but you cannot yet reach the families or prove the return.',
      high: 'Your sponsorship is working hard. The opportunity is taking the same approach to more clubs.'
    },
    areas: [
      {
        id: 'proof', name: 'Proving the return', icon: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2', help: HELP,
        verdict: {
          low: 'You cannot show what the spend delivered, which makes it the first budget to be cut.',
          mid: 'You have activity numbers, but no line from the spend to an outcome.',
          high: 'You can tie spend to results. That is the hardest part, and you have it.'
        },
        qs: [
          { q: 'How do you report on your sport sponsorship today?', opts: ['We don’t', 'Reach and logo exposure estimates', 'Campaign results, not tied to the sponsorship', 'Sales or sign-ups we can trace back to it'], fix: 'Agree two or three outcomes before the season starts, and have them reported club by club.' },
          { q: 'If the board asked what last season’s community spend delivered, what could you show?', opts: ['Not much', 'Photos and thank-you letters', 'Engagement numbers from our own channels', 'A clear line from spend to outcome'], fix: 'Ask for an end-of-season report that links what you spent to what people did.' }
        ]
      },
      {
        id: 'reach', name: 'Reaching families', icon: 'M4 5h16v11H9l-5 4z', help: HELP,
        verdict: {
          low: 'Your money reaches the club, but you have no way to reach the households behind it.',
          mid: 'You can reach some families, mostly by relying on someone else to pass things on.',
          high: 'You have a direct, consented line to club families. Few sponsors do.'
        },
        qs: [
          { q: 'Can you contact the families at the clubs you support?', opts: ['No, we have no contact at all', 'Only if the club passes things on', 'Only if they join our loyalty program themselves', 'Yes, directly, with their consent'], fix: 'Build a consented line to club families, so you are not relying on a club to forward things.' },
          { q: 'How much do you know about who is in those clubs?', opts: ['Nothing', 'Rough player numbers', 'Numbers by club and age group', 'Who they are, with permission to talk to them'], fix: 'Start with clubs that run on one platform, so the audience is known and countable.' }
        ]
      },
      {
        id: 'presence', name: 'Being part of the club week', icon: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M10.5 18.5h3', help: HELP,
        verdict: {
          low: 'Your brand is on the fence, where people stopped noticing it after round one.',
          mid: 'Your brand appears now and then, but it is not part of the club routine.',
          high: 'Your brand is in the tools members use every week.'
        },
        qs: [
          { q: 'Where does your brand show up in a normal club week?', opts: ['Nowhere', 'Signage at the ground', 'Signage, plus the odd social post', 'Inside the tools members use every week'], fix: 'Move from signage to a place in the club app and the messages families open each week.' },
          { q: 'Would club families say your brand helps their club?', opts: ['Most would not know we are involved', 'A few would', 'Many would', 'Yes, they see what comes back'], fix: 'Make what you give visible to members, in the place they already look.' }
        ]
      },
      {
        id: 'activation', name: 'Activations', icon: 'M3 10v4h3l7 4V6L6 10z M17 9a4 4 0 0 1 0 6', help: HELP,
        verdict: {
          low: 'Activations are too costly to run at scale, so most clubs you sponsor never see one.',
          mid: 'You activate at some clubs, with a lot of effort and little data back.',
          high: 'You can activate widely and you know who took part.'
        },
        qs: [
          { q: 'How many clubs can you activate at in a season?', opts: ['None', 'A handful, with agency help', 'Dozens, but it stretches us', 'As many as we choose'], fix: 'Use a program that runs activations for you, club by club, with the kit and instructions supplied.' },
          { q: 'What happens at a typical activation?', opts: ['We don’t run them', 'A marquee, staff and giveaways', 'The club runs something with our kit', 'Members take part on their phones and we see who did'], fix: 'Run activations through the club app, so participation is counted.' }
        ]
      },
      {
        id: 'local', name: 'Local relevance', icon: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z M12 12.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z', help: HELP,
        verdict: {
          low: 'Club families get the same message as everyone else, if they get one at all.',
          mid: 'You tailor by region, but not by club or by what is happening that week.',
          high: 'Your messages follow the club calendar. That is when they get acted on.'
        },
        qs: [
          { q: 'Do your messages change with what is happening at a member’s club?', opts: ['We don’t message them', 'Everyone gets the national campaign', 'By state or region', 'By club, team and time of season'], fix: 'Time messages to training and game schedules, club by club.' },
          { q: 'Can you tell whether club families visit your stores or site?', opts: ['No', 'We guess from sales near grounds', 'For some campaigns', 'Yes, visits and purchases link back to clubs'], fix: 'Link offers to clubs, so a visit or purchase can be traced back.' }
        ]
      },
      {
        id: 'value', name: 'Giving back', icon: 'M12 21C5 15.5 3 12 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5c0 3.5-2 7-9 12.5z', help: HELP,
        verdict: {
          low: 'What you give is a one-off, and it is forgotten by the next season.',
          mid: 'Members get something from you, but the club itself sees little ongoing benefit.',
          high: 'Clubs earn as you sell. That keeps both sides coming back.'
        },
        qs: [
          { q: 'What do clubs get from your sponsorship?', opts: ['Nothing ongoing', 'A one-off grant or equipment', 'Vouchers or discounts for members', 'Ongoing money tied to what members buy'], fix: 'Tie a give-back to member purchases, so the club earns whenever you sell.' },
          { q: 'How well does the sponsorship drive sales?', opts: ['It doesn’t', 'We assume it helps', 'Some lift during campaigns', 'Clearly, and we can measure it'], fix: 'Give members a reason to buy that also helps their club, and measure it.' }
        ]
      }
    ]
  };
})();
