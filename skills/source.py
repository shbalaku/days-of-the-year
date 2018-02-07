# encoding=ascii

from bs4 import BeautifulSoup
import requests
import sys
import json
import datetime


def format_date(date):
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    suffix = ['st', 'nd', 'rd', 'th']
    month = int(date[0]+date[1])
    day = str(int(date[3]+date[4]))
    if (date[3] == '1'):
        suff = suffix[3]
    elif (date[4] == '1'):
        suff = suffix[0]
    elif (date[4] == '2'):
        suff = suffix[1]
    elif (date[4] == '3'):
        suff = suffix[2]
    else:
        suff = suffix[3]

    month_str = months[month-1]
    return([month_str+" " + day + suff, day + suff + " " + month_str])

if __name__ == '__main__':
    args = sys.argv
    date = args[1]
    now = datetime.datetime.now()

    if date == "today":
        if int(now.month<10):
            mon = '0'+str(now.month)
        else:
            mon = str(now.month)
        if int(now.day<10):
            day = '0'+str(now.day)
        else:
            day = str(now.day)
        date = mon + "/" + day
        [date_format1, date_format2] = format_date(date)
        print("Today is " + date_format1)

    else:
        [date_format1, date_format2] = format_date(date)
        print(date_format1)

    year = str(now.year)
    uri_str = 'https://www.daysoftheyear.com/days/'+year+'/'+str(date)
    days = requests.get(uri_str)
    myscrape = BeautifulSoup(days.text, 'html.parser')
    mydays = myscrape.findAll('h3', {'class': 'card-title'})
    date_scrape = myscrape.findAll('h4', {'class': 'card-title-secondary'})
    length = len(mydays)

    for item in range(0,length-1):
        if ((date_format1 in date_scrape[item].text) or (date_format2 in date_scrape[item].text)):
            print(mydays[item].text.encode("utf8"))
