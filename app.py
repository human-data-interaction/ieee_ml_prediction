from flask import Flask, render_template, url_for, request
import pandas as pd
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report
from sklearn.externals import joblib


app = Flask(__name__)


@app.route('/')
def home():
	return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
	df = pd.read_csv("data/ieee.csv", encoding="latin-1")
	df = df[['Conference','Abstract']]
	df.drop(df[df.isnull().any(axis=1)].index,inplace=True)
 
 	# Features and Labels
	df['label'] = df['Conference'].map({'InfoVis': 0, 'SciVis': 1, 'VAST':2, 'Vis':3})
	X = df['Abstract']
	y = df['label']

	# Extract Feature With CountVectorizer
	cv = CountVectorizer()
	X = cv.fit_transform(X)  
 
 	# Fit the Data
	from sklearn.model_selection import train_test_split
	X_train, X_test, y_train, y_test = train_test_split(
	    X, y, test_size=0.33, random_state=42)
 
	# Naive Bayes Classifier
	from sklearn.naive_bayes import MultinomialNB

	clf = MultinomialNB()
	clf.fit(X_train, y_train)
	clf.score(X_test, y_test)

	# Alternative Usage of Saved Model
	# joblib.dump(clf, 'NB_spam_model.pkl')
	# NB_spam_model = open('NB_spam_model.pkl','rb')
	# clf = joblib.load(NB_spam_model)

	if request.method == 'POST':
		message = request.form['message']
		data = [message]
		vect = cv.transform(data).toarray()
		y_pred = clf.predict(X_test)
		my_prediction = clf.predict(vect)
		my_report = classification_report(y_test, y_pred, output_dict=True)
		# print(my_report)
	return render_template('prediction.html',prediction = my_prediction, report = my_report)

if __name__ == '__main__':
	app.run(debug=True)
