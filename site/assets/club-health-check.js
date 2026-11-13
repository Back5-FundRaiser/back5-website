/* Club health check: the areas, questions, advice and wording.
   Every question has four answers, ordered from weakest (0 points) to
   strongest (3 points). `fix` is the advice shown when the answer is weak.
   Edit the wording here; the scoring and layout live in health-check.js. */
window.B5_CHECK = {
  intro: 'Seven areas, three questions each. About five minutes, and you get a scorecard that says what to fix first.',
  headline: {
    low: 'The club is running on goodwill. A few changes would take real pressure off the people holding it together.',
    mid: 'The basics are in place. The gains now are in joining things up and adding income that does not need a volunteer.',
    high: 'The club is in good shape off the field. The opportunity now is growth.'
  },
  areas: [
    {
      id: 'admin', name: 'Running the club',
      icon: 'M3 5h18v11H3z M8 20h8 M12 16v4',
      help: { name: 'Club software', href: '/club-software/', text: 'Rego, payments, messages and scheduling in one app, set up and run with you.' },
      verdict: {
        low: 'Too much of the club runs by hand. That is where volunteer hours and unpaid fees are going.',
        mid: 'The club is partly online, but the pieces do not talk to each other, so people still fill the gaps.',
        high: 'Registration and payments run themselves. Keep it that way as the club grows.'
      },
      qs: [
        { q: 'How do people register for a season?', opts: ['Paper forms or a spreadsheet', 'An online form that someone re-types', 'An online system, separate from payments', 'Online, with payment in the same step'], fix: 'Move registration online with payment in the same step, so nobody re-types a form or matches names to a bank statement.' },
        { q: 'How do fees get collected?', opts: ['Cash or bank transfer, ticked off by hand', 'Online, but we chase a lot of late payers', 'Online, with automatic reminders', 'Online, with payment plans and almost nothing outstanding'], fix: 'Turn on automatic reminders and payment plans, so the treasurer stops chasing families.' },
        { q: 'How many different tools does a team manager use in a normal week?', opts: ['Five or more', 'Three or four', 'Two', 'One'], fix: 'Bring rego, messages and scheduling into one app, so managers and parents have one place to look.' }
      ]
    },
    {
      id: 'people', name: 'Volunteers',
      icon: 'M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M2 21c0-4 3-6 7-6s7 2 7 6 M17 3.5a4 4 0 0 1 0 7.5 M22 21c0-3-1.5-5-4-5.7',
      help: { name: 'Club software', href: '/club-software/', text: 'Automation takes over the chasing and re-typing, so the jobs left are small enough to share.' },
      verdict: {
        low: 'The club depends on one or two people. If either steps back, a season is at risk.',
        mid: 'There is a core group, but the load is uneven and handovers would be bumpy.',
        high: 'The work is shared and written down. That is rare, and worth protecting.'
      },
      qs: [
        { q: 'If your registrar or treasurer stepped down tomorrow, what would happen?', opts: ['Nobody else knows how it works', 'One other person could muddle through', 'It is written down somewhere', 'Someone else could take over this week'], fix: 'Get the key jobs out of one person’s head: put them in a shared system and write a one-page handover for each role.' },
        { q: 'How many people do most of the off-field work?', opts: ['One or two', 'Three to five', 'Six to ten', 'More than ten, with clear roles'], fix: 'Break the big roles into small jobs a parent can do from their phone in ten minutes.' },
        { q: 'How do you find new volunteers?', opts: ['We plead at the AGM', 'A message goes out and the same people reply', 'We ask specific parents for specific jobs', 'Parents pick a small job when they register'], fix: 'Ask every family to pick one small job at registration, when goodwill is highest.' }
      ]
    },
    {
      id: 'comms', name: 'Reaching your community',
      icon: 'M4 5h16v11H9l-5 4z',
      help: { name: 'Club software', href: '/club-software/', text: 'One message reaches the whole club, an age group or a single team, using contact details collected at rego.' },
      verdict: {
        low: 'The club cannot reliably reach its own families. That costs time now and sponsors later.',
        mid: 'Messages get out, but not to everyone, and mostly when the club needs something.',
        high: 'Families hear from the club regularly and in one place. Sponsors value exactly this.'
      },
      qs: [
        { q: 'A game is washed out at 7am. How does everyone find out?', opts: ['Phone calls, and hoping word spreads', 'Team group chats, one at a time', 'An email or post that some people see', 'One alert that reaches every affected family in minutes'], fix: 'Set up one channel that reaches every family, sorted by team, so a wash-out takes one message.' },
        { q: 'Where are the contact details for your families?', opts: ['On coaches’ phones', 'In a list from a past season', 'Current, but spread across a few places', 'Current, and in one place'], fix: 'Collect contact details at registration and keep them in one place the committee can use.' },
        { q: 'How often do members hear from the club, apart from fixtures?', opts: ['Hardly ever', 'When we need money or volunteers', 'A regular update most months', 'Regular news people open, with good-news stories'], fix: 'Send a short monthly update with one good-news story, so not every message is an ask.' }
      ]
    },
    {
      id: 'money', name: 'Money coming in',
      icon: 'M12 22a10 10 0 1 0 0-20a10 10 0 0 0 0 20z M15 9c-.5-1.2-1.6-2-3-2-1.7 0-3 1-3 2.5S10.3 12 12 12s3 1 3 2.5S13.7 17 12 17c-1.4 0-2.5-.8-3-2 M12 5v2 M12 17v2',
      help: { name: 'Club Marketplace and Club Mobile', href: '/club-marketplace/', text: 'Income from what families already buy and from their phone plans, arriving every month without an event.' },
      verdict: {
        low: 'The club lives on fees and events. One bad season or one tired volunteer puts the budget at risk.',
        mid: 'There is more than one income source, but most still need someone to run something.',
        high: 'Income is spread and steady. The next step is growing the sources that need no effort.'
      },
      qs: [
        { q: 'Where does the club’s money come from?', opts: ['Almost all from rego fees', 'Fees plus the canteen or bar', 'Fees, canteen and a couple of fundraisers', 'Several steady sources, so no single one worries us'], fix: 'Add at least one new income source this season, so fees are not carrying the whole budget.' },
        { q: 'How much income arrives without a volunteer running something?', opts: ['None', 'A little, from one sponsor or grant', 'Some, but it varies a lot', 'A reliable amount every month'], fix: 'Set up income that repeats by itself, such as a share of members’ everyday shopping or phone plans.' },
        { q: 'How did last season end financially?', opts: ['The committee topped it up from their own pockets', 'We just broke even', 'A small surplus', 'A surplus, and a reserve in the bank'], fix: 'Set a surplus target for the season and build towards a reserve of three months’ running costs.' }
      ]
    },
    {
      id: 'kit', name: 'Kit and merchandise',
      icon: 'M8 3 L3 6 l2 4 l3-1.5 V21 h8 V8.5 l3 1.5 l2-4 L16 3 c-.5 2-2 3-4 3 s-3.5-1-4-3z',
      help: { name: 'Club Apparel', href: '/club-apparel/', text: 'An online club shop run by our apparel partners, with the club earning on each order.' },
      verdict: {
        low: 'Kit is costing the club time and money when it should be making both.',
        mid: 'Kit ordering works, but it still leans on a volunteer and earns very little.',
        high: 'Kit runs itself and earns for the club. A wider supporter range is the next gain.'
      },
      qs: [
        { q: 'How is kit ordered?', opts: ['A volunteer collects sizes and money by hand', 'Order forms, then one bulk order', 'Through a supplier’s site, with us chasing people', 'Members order and pay online themselves'], fix: 'Move kit to an online club shop, so members order and pay for themselves.' },
        { q: 'What happens to leftover stock?', opts: ['We have boxes of it', 'Some is left each season', 'Very little', 'None'], fix: 'Order closer to real demand, so the club stops paying for stock that sits in a garage.' },
        { q: 'Does the club make money on kit and supporter wear?', opts: ['We lose money on it', 'We sell at cost', 'A small margin', 'It is a reliable earner, supporter wear included'], fix: 'Build in a margin and add a supporter range, so kit becomes an earner.' }
      ]
    },
    {
      id: 'sponsors', name: 'Sponsors and partners',
      icon: 'M3 10v4h3l7 4V6L6 10z M17 9a4 4 0 0 1 0 6',
      help: { name: 'Brand programs', href: '/#programs', text: 'Clubs in the network can be chosen for brand programs that bring offers and money back, run for you.' },
      verdict: {
        low: 'Sponsors are giving out of goodwill and getting little back. That money is fragile.',
        mid: 'Sponsors get something for their money, but the club cannot yet prove what.',
        high: 'Sponsors get real value and come back. You are ready for bigger partners.'
      },
      qs: [
        { q: 'What does a sponsor get from your club?', opts: ['A sign and a thank-you', 'Signs plus social posts', 'A package with offers to our members', 'A package, with results we report back'], fix: 'Build two or three sponsor packages that include an offer to members, so sponsors get more than a sign.' },
        { q: 'Could you tell a sponsor how many families you reach each week?', opts: ['No idea', 'A rough guess', 'Player numbers only', 'Yes, families reached and how many engaged'], fix: 'Start counting your reach: families, messages opened, people at the ground. Sponsors pay for numbers.' },
        { q: 'How many sponsors renewed last season?', opts: ['We start from scratch each year', 'Fewer than half', 'Most', 'Nearly all, and some increased'], fix: 'Send every sponsor a short end-of-season report, then ask for the renewal.' }
      ]
    },
    {
      id: 'brand', name: 'Brand and profile',
      icon: 'M5 22V3 M5 4h13l-3 4.5L18 13H5',
      help: { name: 'Club Brand Positioning', href: '/club-brand-positioning/', text: 'A full rebuild of how the club shows up, from identity to sponsorship packages.' },
      verdict: {
        low: 'The club is hard to find and looks dated. New families and sponsors judge that before anything else.',
        mid: 'The club looks fine, but nothing sets it apart from the one down the road.',
        high: 'The club looks the part and people know what it stands for.'
      },
      qs: [
        { q: 'When were the badge, kit design and website last refreshed?', opts: ['Nobody remembers', 'In bits, over many years', 'In the last five years', 'Recently, and they all match'], fix: 'Refresh the badge, kit and website together, so the club looks like one club everywhere.' },
        { q: 'Why do new families choose your club?', opts: ['We are the closest', 'Their friends are already here', 'Our results or coaches', 'They know what we stand for'], fix: 'Decide what the club stands for in one sentence, and put it everywhere a new family looks.' },
        { q: 'What does a new family find when they search for the club?', opts: ['Not much, or out-of-date pages', 'A basic page with contact details', 'A current site that explains how to join', 'A current site, active socials and a clear way to register'], fix: 'Make sure a search for the club leads to a current page with a clear way to join.' }
      ]
    }
  ]
};
