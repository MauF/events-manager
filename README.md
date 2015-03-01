# events-manager
webapp for handle the events (firebase + angularjs)


curl -s --user 'api:key-6f53fd6a288e731228b4d85f583449f2' \
    https://api.mailgun.net/v2/sandbox2c277c6207da4f0487c8ca09f6fc3c06.mailgun.org/messages \
    -F from='Mailgun Sandbox <postmaster@sandbox2c277c6207da4f0487c8ca09f6fc3c06.mailgun.org>' \
    -F to='event-manager <maurizio.fassone@gmail.com>'\
    -F subject='Hello event-manager' \
    -F text='Congratulations event-manager, you just sent an email with Mailgun!  You are truly awesome! 

You can see a record of this email in your logs: https://mailgun.com/cp/log 

You can send up to 300 emails/day from this sandbox server. Next, you should add your own domain so you can send 10,000 emails/month for free.'
