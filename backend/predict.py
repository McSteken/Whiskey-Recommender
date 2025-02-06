import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag
from nltk.corpus import stopwords
import os;

nltk.download('punkt_tab') # for tokenization
nltk.download('wordnet') # for lemmatization
nltk.download('averaged_perceptron_tagger_eng') # for POS tagging
nltk.download('stopwords') # for stopwords


# Colors for the output
PURPLE = '\033[95m'
GREEN = '\033[92m'
BLUE = '\033[94m'
END = '\033[0m'
BOLD = '\033[1m'
UNDERLINE = '\033[4m'

script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'whiskey_data.csv')

# Load the data
whiskey = pd.read_csv(csv_path)
# Check for missing values
#print(whiskey.isnull().sum())

# Convert the 'price' column to numeric values
whiskey['price'] = pd.to_numeric(whiskey['price'], errors='coerce')
# Drop rows with missing values
whiskey = whiskey.dropna()
# Custom stop words specific to whiskey descriptions
custom_stop_words = set(stopwords.words('english')).union({'whiskey', 'whisky', 'bottle', 'flavor', 'taste'})


print(whiskey.head())
# Print dimensions
print(whiskey.shape)

# Recommend whiskey based on similarity

# Filter whiskies based on price
def filter_price(price):
    return whiskey[whiskey['price'] <= price]

def preprocess_text(text):
    # Tokenize the text
    tokens = word_tokenize(text.lower())
    # Remove stop words
    tokens = [token for token in tokens if token not in custom_stop_words]
     # Lemmatize the tokens (convert to their base form)
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    tagged_tokens = pos_tag(tokens)
    # Filter for nouns, adjectives, and adverbs
    keywords = [word for word, tag in tagged_tokens if tag in ('NN', 'NNS', 'JJ', 'RB')] # NN: noun, NNS: plural noun, JJ: adjective, RB: adverb
    return ' '.join(keywords)

# Preprocess the descriptions
preprocessed_descriptions = whiskey['description'].apply(preprocess_text)
print(preprocessed_descriptions.head())
print(preprocessed_descriptions.shape)

# Seacrh for a whiskey by name using one or more words
def search_whiskey(name):
    return whiskey[whiskey['name'].str.contains(name, case=False)]


# Function to get recommendations
def get_recommendations(whiskey_name, price):
    # Filter whiskies based on price
    whiskey = filter_price(price)


    # Check if the whiskey_name exists in the filtered dataset
    if whiskey_name not in whiskey['name'].values:
        print(f"Whiskey '{whiskey_name}' not found in the dataset.")
        return []


    # Vectorize the descriptions using tf-idf
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(preprocessed_descriptions)

    # Calculate the cosine similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Get the index of the whiskey that matches the title
    idx = whiskey[whiskey['name'] == whiskey_name].index[0]

    # Get the pairwise similarity scores of all whiskies with that whisky
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort the whiskies based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get the scores of the 10 most similar whiskies
    sim_scores = sim_scores[1:11]

    # Get the whisky indices
    whiskey_indices = [i[0] for i in sim_scores]

    # print top 10 most similar whiskeys and their similarity scores and price
    print(f"Preprocessed description of {whiskey_name}: {preprocessed_descriptions.iloc[idx]}")
    print(f"\n{PURPLE}{UNDERLINE}Whiskeys most similar to {whiskey_name}:{END}")
    for i, score in zip(whiskey_indices, sim_scores):
        print(f"{GREEN}{BOLD}{whiskey['name'].iloc[i]}{END}: {score[1]:.6f} {BLUE}Price: {END}${whiskey['price'].iloc[i]}")
        print(f"Preprocessed description: {preprocessed_descriptions.iloc[i]}")



# Get recommendations for a whisky
# Input the title of the whisky
print('Enter the name of the whiskey for recommendations:')
whiskey_name = input()
print('Enter maximum price for the whiskey:')
price = float(input())
print('\n')
print('Top 10 recommended whiskies:')
print(get_recommendations(whiskey_name, price))
