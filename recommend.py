import pandas as pd
import json
import sys
from sklearn.metrics.pairwise import cosine_similarity

df = pd.read_csv("Recommend.csv")

features = df[['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'W', 'F', 'Difficulty_score', 'Difficulty_Level', 'Popularity_score']]

similarity_matrix = cosine_similarity(features)

faculty_course_mapping = df.groupby('Faculty')['Course'].apply(list).to_dict()

def recommend_courses_for_course_id(course_id):

  faculty_name = df[df['Course'] == course_id]['Faculty'].iloc[0]

  course_indices = df[df['Faculty'] == faculty_name].index

  target_index = df[df['Course'] == course_id].index[0]
  similarities = [(i, similarity_matrix[target_index, i]) for i in course_indices if i != target_index]

  sorted_similarities = sorted(similarities, key=lambda x: -x[1])
  recommended_course_indices = [course_index for course_index, _ in sorted_similarities[:5]]
  recommended_courses = [df.loc[i, "Course"] for i in recommended_course_indices]

  return recommended_courses
  
if __name__ == "__main__":
    course_id = sys.argv[1]
    print("hello")
    recommended_courses = recommend_courses_for_course_id(course_id)
    print(json.dumps(recommended_courses))