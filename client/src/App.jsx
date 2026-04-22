import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import { setUserData } from './redux/userSlice'
import { useDispatch } from 'react-redux'
import InterviewPage from './pages/InterviewPage'
import axios from 'axios'
import Pricing from './pages/Pricing'
import InterviewHistory from './pages/InterviewHistory'
import InterviewReport from './pages/InterviewReport'


export const ServerUrl = "https://ai-interview-assistant-7foy.onrender.com"

const App = () => {
  const dispatch = useDispatch()
  useEffect(()=>{
    const getUser = async() => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user",{withCredentials: true})
        dispatch(setUserData(result.data))
        console.log(result.data)
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    getUser()
  },[dispatch])
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/auth" element={<Auth/>}/>
      <Route path='/interview' element={<InterviewPage/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>
    </Routes>
  )
}

export default App
