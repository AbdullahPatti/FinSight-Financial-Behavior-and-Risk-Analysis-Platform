import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.preprocessing import LabelEncoder
import joblib
import re

DATA_PATH = 'NovaTech_HMM.csv'
RANDOM_STATE = 42

df = pd.read_csv(DATA_PATH)
df['desc_clean'] = df['transaction_description'].str.lower().str.replace(r'[^a-z\s]', ' ', regex=True)

tfidf = TfidfVectorizer(ngram_range=(1,2), max_features=3000, sublinear_tf=True, min_df=2)
X = tfidf.fit_transform(df['desc_clean'])

le = LabelEncoder()
y = le.fit_transform(df['expense_category'])

model = LogisticRegression(C=5.0, solver='saga', max_iter=1000, random_state=RANDOM_STATE)
skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_STATE)
y_pred_cv = cross_val_predict(model, X, y, cv=skf)

model.fit(X, y)
y_pred_full = model.predict(X)

df['predicted_category'] = le.inverse_transform(y_pred_full)
df['predicted_category_cv'] = le.inverse_transform(y_pred_cv)
df['correct'] = (df['expense_category'] == df['predicted_category_cv'])

df.to_csv('nlp_predictions.csv', index=False)
joblib.dump(tfidf, 'tfidf_vectorizer.pkl')
joblib.dump(model, 'nlp_logreg.pkl')
joblib.dump(le, 'label_encoder.pkl')
print("NLP pipeline finished - nlp_predictions.csv + tfidf_vectorizer.pkl, nlp_logreg.pkl, label_encoder.pkl created")