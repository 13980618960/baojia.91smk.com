import request from './request'

export const useAreaUtils = (provinceRef, cityRef, districtRef, citiesRef, districtsRef) => {
  const fetchProvinces = async () => {
    try {
      const res = await request.get('/admin/areas/provinces')
      provinceRef.value = res.data || []
    } catch (error) {
      console.error('获取省份列表失败:', error)
    }
  }

  const fetchCities = async (provinceId) => {
    try {
      const res = await request.get('/admin/areas/cities', { params: { province_id: provinceId } })
      citiesRef.value = res.data || []
      districtRef.value = ''
      districtsRef.value = []
    } catch (error) {
      console.error('获取城市列表失败:', error)
    }
  }

  const fetchDistricts = async (cityId) => {
    try {
      const res = await request.get('/admin/areas/districts', { params: { city_id: cityId } })
      districtsRef.value = res.data || []
    } catch (error) {
      console.error('获取区县列表失败:', error)
    }
  }

  const handleAreaFilterChange = (level, filterProvince, filterCity, filterDistrict) => {
    if (level === 'province') {
      const province = provinceRef.value.find(p => p.name === filterProvince)
      if (province) {
        fetchCities(province.area_id)
      } else {
        cityRef.value = ''
        districtRef.value = ''
        citiesRef.value = []
        districtsRef.value = []
      }
    } else if (level === 'city') {
      const city = citiesRef.value.find(c => c.name === filterCity)
      if (city) {
        fetchDistricts(city.area_id)
      } else {
        districtRef.value = ''
        districtsRef.value = []
      }
    }
  }

  return {
    fetchProvinces,
    fetchCities,
    fetchDistricts,
    handleAreaFilterChange
  }
}
