import { useQuery, useMutation } from "@tanstack/react-query";
import { ScrollView, View, Text, TextInput, TouchableOpacity, useWindowDimensions, Modal } from "react-native";
import { Formik } from "formik";
import { useState } from "react";

import { queryOptions } from "@/constants/query";
import MasonryList from "@/components/Masonry";

export default function Index() {
  const { data } = useQuery(queryOptions.movies.favorites);
  const { mutate: addFavorite } = useMutation(queryOptions.movies.markAsFavorite);
  const { width } = useWindowDimensions();
  const [showForm, setShowForm] = useState(width > 768);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleAddMovie = (values: { name: string; description: string; platform: string; cover: string }) => {
    const newMovie = {
      id: Date.now().toString(),
      primaryTitle: values.name,
      url: values.cover,
    };
    addFavorite(newMovie);
  };

  const isLargeScreen = width > 768;

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', flexDirection: isLargeScreen ? 'row' : 'column' }}>
      {isLargeScreen && showForm && (
        <View style={{ width: 300, padding: 20, position: 'relative' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, marginBottom: 10 }}>Add Custom Movie</Text>
          <Formik
            initialValues={{ name: '', description: '', platform: '', cover: '' }}
            validate={(values) => {
              const errors: any = {};
              if (!values.name.trim()) {
                errors.name = 'Movie name is required';
              }
              if (values.cover && !isValidUrl(values.cover)) {
                errors.cover = 'Please enter a valid URL';
              }
              return errors;
            }}
            onSubmit={handleAddMovie}
          >
                  {({ handleChange, handleSubmit, values, errors, touched }) => (
              <View>
                <TextInput
                  style={{
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    padding: 10,
                    marginBottom: 5,
                    borderRadius: 5,
                  }}
                  placeholder="Movie Name (e.g. Inception)"
                  placeholderTextColor="#CCCCCC"
                  value={values.name}
                  onChangeText={handleChange('name')}
                />
                {touched.name && errors.name && <Text style={{ color: '#E50914', fontSize: 12, marginBottom: 10 }}>{errors.name}</Text>}
                <TextInput
                  style={{
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    padding: 10,
                    marginBottom: 5,
                    borderRadius: 5,
                  }}
                  placeholder="Description (e.g. A mind-bending sci-fi thriller)"
                  placeholderTextColor="#CCCCCC"
                  value={values.description}
                  onChangeText={handleChange('description')}
                />
                <TextInput
                  style={{
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    padding: 10,
                    marginBottom: 5,
                    borderRadius: 5,
                  }}
                  placeholder="Platform (e.g. Netflix, HBO, Disney+)"
                  placeholderTextColor="#CCCCCC"
                  value={values.platform}
                  onChangeText={handleChange('platform')}
                />
                <TextInput
                  style={{
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    padding: 10,
                    marginBottom: 5,
                    borderRadius: 5,
                  }}
                  placeholder="Cover URL (e.g. https://example.com/movie-poster.jpg)"
                  placeholderTextColor="#CCCCCC"
                  value={values.cover}
                  onChangeText={handleChange('cover')}
                />
                {touched.cover && errors.cover && <Text style={{ color: '#E50914', fontSize: 12, marginBottom: 10 }}>{errors.cover}</Text>}
                <TextInput
                  style={{
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 5,
                  }}
                  placeholder="Description (e.g. A mind-bending sci-fi thriller)"
                  placeholderTextColor="#CCCCCC"
                  value={values.description}
                  onChangeText={handleChange('description')}
                />
                <TextInput
                  style={{
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 5,
                  }}
                  placeholder="Platform (e.g. Netflix, HBO, Disney+)"
                  placeholderTextColor="#CCCCCC"
                  value={values.platform}
                  onChangeText={handleChange('platform')}
                />
                <TextInput
                  style={{
                    backgroundColor: '#333333',
                    color: '#FFFFFF',
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 5,
                  }}
                        placeholder="Cover URL (e.g. https://example.com/movie-poster.jpg)"
                  placeholderTextColor="#CCCCCC"
                  value={values.picture}
                  onChangeText={handleChange('picture')}
                />
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  style={{
                    backgroundColor: '#E50914',
                    padding: 10,
                    borderRadius: 5,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Add Movie</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
          <TouchableOpacity
            onPress={() => setShowForm(false)}
            style={{
              position: 'absolute',
              right: -10,
              top: '50%',
              transform: [{ translateY: -50 }],
              width: 20,
              height: 60,
              backgroundColor: '#E50914',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 5,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12 }}>‹</Text>
          </TouchableOpacity>
        </View>
      )}
      {isLargeScreen ? (
        <View style={{ flex: 1, position: 'relative' }}>
          {!showForm && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={{
                position: 'absolute',
                left: -10,
                top: '50%',
                transform: [{ translateY: -50 }],
                width: 20,
                height: 60,
                backgroundColor: '#E50914',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5,
                zIndex: 10,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>›</Text>
            </TouchableOpacity>
          )}
          <ScrollView>
            <MasonryList
              data={
                data?.map((item) => ({
                  key: item.id,
                  imageSrc: item.url,
                  title: item.primaryTitle,
                })) || []
              }
            />
          </ScrollView>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            <MasonryList
              data={
                data?.map((item) => ({
                  key: item.id,
                  imageSrc: item.url,
                  title: item.primaryTitle,
                })) || []
              }
            />
          </ScrollView>
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: '#E50914',
              padding: 15,
              borderRadius: 30,
              elevation: 5,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>+</Text>
          </TouchableOpacity>
          <Modal
            visible={showForm}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowForm(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ width: '90%', backgroundColor: '#000000', padding: 20, borderRadius: 10 }}>
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  style={{ alignSelf: 'flex-end', marginBottom: 10 }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 18 }}>×</Text>
                </TouchableOpacity>
                <Text style={{ color: '#FFFFFF', fontSize: 18, marginBottom: 10 }}>Add Custom Movie</Text>
                <Formik
                  initialValues={{ name: '', description: '', platform: '', cover: '' }}
                  validate={(values) => {
                    const errors: any = {};
                    if (!values.name.trim()) {
                      errors.name = 'Movie name is required';
                    }
                    if (values.cover && !isValidUrl(values.cover)) {
                      errors.cover = 'Please enter a valid URL';
                    }
                    return errors;
                  }}
                  onSubmit={(values) => {
                    handleAddMovie(values);
                    setShowForm(false);
                  }}
                >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
                    <View>
                      <TextInput
                        style={{
                          backgroundColor: '#333333',
                          color: '#FFFFFF',
                          padding: 10,
                          marginBottom: 5,
                          borderRadius: 5,
                        }}
                        placeholder="Movie Name (e.g. Inception)"
                        placeholderTextColor="#CCCCCC"
                        value={values.name}
                        onChangeText={handleChange('name')}
                      />
                      {touched.name && errors.name && <Text style={{ color: '#E50914', fontSize: 12, marginBottom: 10 }}>{errors.name}</Text>}
                      <TextInput
                        style={{
                          backgroundColor: '#333333',
                          color: '#FFFFFF',
                          padding: 10,
                          marginBottom: 5,
                          borderRadius: 5,
                        }}
                        placeholder="Description (e.g. A mind-bending sci-fi thriller)"
                        placeholderTextColor="#CCCCCC"
                        value={values.description}
                        onChangeText={handleChange('description')}
                      />
                      <TextInput
                        style={{
                          backgroundColor: '#333333',
                          color: '#FFFFFF',
                          padding: 10,
                          marginBottom: 5,
                          borderRadius: 5,
                        }}
                        placeholder="Platform (e.g. Netflix, HBO, Disney+)"
                        placeholderTextColor="#CCCCCC"
                        value={values.platform}
                        onChangeText={handleChange('platform')}
                      />
                      <TextInput
                        style={{
                          backgroundColor: '#333333',
                          color: '#FFFFFF',
                          padding: 10,
                          marginBottom: 5,
                          borderRadius: 5,
                        }}
                        placeholder="Cover URL (e.g. https://example.com/movie-poster.jpg)"
                        placeholderTextColor="#CCCCCC"
                        value={values.cover}
                        onChangeText={handleChange('cover')}
                      />
                      {touched.cover && errors.cover && <Text style={{ color: '#E50914', fontSize: 12, marginBottom: 10 }}>{errors.cover}</Text>}
                      <TouchableOpacity
                        onPress={() => handleSubmit()}
                        style={{
                          backgroundColor: '#E50914',
                          padding: 10,
                          borderRadius: 5,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Add Movie</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}
