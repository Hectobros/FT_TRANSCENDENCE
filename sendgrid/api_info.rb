require 'sendgrid-ruby'
require 'dotenv'

Dotenv.load("../.env")
include SendGrid

sg = SendGrid::API.new(api_key: ENV["EMAIL_PASSWORD"])

response = sg.client.user.credits.get()
puts response.status_code

JSON.parse(response.body).each{|key, value| puts "#{key} => #{value}"}